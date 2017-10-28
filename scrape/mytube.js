const elastic = require('./../search_module/elastic'),
    request = require('../modules/charset'),
    options = {
      method: "GET",            //Set HTTP method
      jar: true,              //Enable cookies
      headers: {              //Set headers
        'user-agent': 'Mozilla/5.0'
      }
    },
    makeDriver = require('request-x-ray'),
    driver = makeDriver(options),    //Create driver
    u = require('url'),
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        parseInt: function (value){
          return typeof value === 'string' ? parseInt(value) : value
        },
        date: function (value) {
          return typeof value === 'string' ? elastic.moment(value, 'DD MMMM YYYY', 'ru').toISOString() : value
        }
      }
    }).driver(driver);

const START_URL = "http://mytube.uz/",
    SHORT_ADDRESS = "mytube.uz",
    MAX_PAGES_TO_VISIT = 1000000,
    SELECTOR = {  
      title: 'h2',
      description:'#aboutUser pre | whiteSpace',
      views: '.Views-Container | parseInt',
      publishDate: '.Date | date',
      // videoLink: 'a[href*=".mp4"]@href',
      category: '.userinfobox-categories-tags-container a:first-child | whiteSpace',
      tags: ['.userinfobox-categories-tags-container a:not(:first-child) | whiteSpace'],
      pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]@href']
    }
    reindex = false;

    function condition(obj){
      return  (obj.category !== undefined && url.startsWith(START_URL));
    };

let numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: SHORT_ADDRESS}, doc_as_upsert : true}, crawl() );

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  elastic.nextPage(SHORT_ADDRESS, function(nextPage){
    if (nextPage){
      elastic.exists(nextPage, function(exists){
        if (exists === true) {
        // We've already visited this page, so repeat the crawl
          crawl();
        }
        // New page we haven't visited
        else {
          elastic.checkUrl(nextPage, crawl, function(){
            visitPage(nextPage, crawl)
          });
        }
      })
    }
  })
}

function visitPage(url, callback) {
  numPagesVisited++;
  console.log("Visiting page " + numPagesVisited + ': ' + url);

  x(url, SELECTOR)(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      let time = new Date().toISOString();     
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks
      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
        obj.crawledDate = time;
        console.log(obj)

        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
                params : {time : time}
              }}, final )       
        );
      } else final();
      
      function final(){
        for (i = 0; i < pageLinks.length; i++) {
          if (!u.parse(pageLinks[i]).hostname.includes(SHORT_ADDRESS) || !pageLinks[i].startsWith('http') || pageLinks[i].includes('mytube.uz/uz/') || pageLinks[i].includes('mytube.uz/oz/')) {
            // console.log('___________________________' + 
              pageLinks.splice(i, 1)
            // );
          }
          if (i >= pageLinks.length - 1 ){
            // console.log(obj);
            elastic.linksToVisit(pageLinks, SHORT_ADDRESS, function(){
              elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
                params : {time : time}
              }}, callback)
            })
          }
        }
      }
    }
  });
};