const elastic = require('./../search_module/elastic'),
    request = require('./charset'),
    options = {
      method: "GET",            //Set HTTP method
      jar: true,              //Enable cookies
      headers: {              //Set headers
        "User-Agent": "Firefox/48.0",
        "cookie": "MYTUBEAUTH.UZ=716FF1AAF9555F240352AC9106AE5FC2501FF71006E29AC591BD1FAD9F918B42CC7F48333A090702DA10A7F701FFA6D0A485A03280A669190D511E298F5B7AAE"
      }
    },
    makeDriver = require('request-x-ray'),
    driver = makeDriver(options),    //Create driver
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        }
      }
    }).driver(driver);

const START_URL = "http://mytube.uz/",
    SHORT_ADDRESS = "mytube.uz",
    MAX_PAGES_TO_VISIT = 1000000;

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

  x(url, {  
    title: 'h2',
    description:'#aboutUser pre | whiteSpace',
    // videoLink: 'a[href*=".mp4"]@href',
    category: '.userinfobox-categories-tags-container a:first-child | whiteSpace',
    tags: ['.userinfobox-categories-tags-container a:not(:first-child) | whiteSpace'],
    pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]@href']
  })(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      console.log(obj);
      let time = elastic.getDateTime();      
      
      if (obj.category !== undefined && url.startsWith(START_URL)) {
        console.log(obj);
        console.log('video found at page ' + url);
        obj.crawledDate = time;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true}, final);
      } else final();
      
      function final(){      
        elastic.linksToVisit(obj.pageLinks, SHORT_ADDRESS, function(){
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
            params : {time : time}
          }}, callback)
        })
      }
    }
  });
};