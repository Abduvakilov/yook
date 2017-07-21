const elastic = require('./../search_module/elastic'),
    // request = require('./charset'),
    entities = require('entities'),
    u = require('url'),
    // options = {
    //   method: "GET",            //Set HTTP method
    //   jar: true,              //Enable cookies
    //   headers: {              //Set headers
    //     "User-Agent": "Firefox/48.0"
    //     // cookie: ["bb_data=a%3A3%3A%7Bs%3A2%3A%22uk%22%3Bs%3A12%3A%22Am02x2osQBjQ%22%3Bs%3A3%3A%22uid%22%3Bi%3A45518%3Bs%3A3%3A%22sid%22%3Bs%3A20%3A%22na1pTsr1t0xWPewUDmSD%22%3B%7D; bb_t=a%3A1%3A%7Bi%3A115729%3Bi%3A1499880881%3B%7D; smart_top=1"]
    //   }
    // },
    // makeDriver = require('request-x-ray'),
    // driver = makeDriver(options),    //Create driver
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        decode: function (value) {
          return typeof value === 'string' ? entities.decodeHTML(value) : value
        },
        replaceLineBreak: function (value) { 
          return typeof value === 'string' ? value.replace(/\<br\>/g, ';;') : value
        },
        afterATag: function (value){
          return typeof value === 'string' ? value.split('</a>')[1] : value
        },
        parseInt: function (value){
          return typeof value === 'string' ? parseInt(value) : value
        }
      }
    })//.driver(driver) 

const START_URL = "https://mover.uz",
    SHORT_ADDRESS = "mover.uz",
    MAX_PAGES_TO_VISIT = 100000,
    SCRAPE_OBJECT = {  
      title: '.fl.video-title | whiteSpace | decode',
      description: ['div.desc p:not(.cat-date):not(.tags)| decode'],
      views: 'span.fr.views | parseInt',
      likes: 'table.r-desc td.like@html | parseInt',
      dislikes: 'table.r-desc td.dislike@html | parseInt',
      category: 'p.cat-date a | decode',
      datePublished: 'p.cat-date@html | afterATag | decode | whiteSpace',
      tags: ['p.tags a | decode'],
      pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]:not([href$=".jpg"])@href']
    };
function condition (obj){
  return  obj.views !== undefined
}

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

  x(url, SCRAPE_OBJECT)(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      let time = elastic.getDateTime();      
      
      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
        obj.crawledDate = time;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : "ctx._source.remove('crawled')", upsert: {crawledDate: time }}, final )       
        );
      } else final()
      
      function final(){
        for (i = 0; i < obj.pageLinks.length; i++) {
          if (!u.parse(obj.pageLinks[i]).hostname.includes(SHORT_ADDRESS)){
            console.log('___________________________' + obj.pageLinks.splice(i, 1));
          }
          if (i >= obj.pageLinks.length - 1 ){
            console.log(obj);
            elastic.linksToVisit(obj.pageLinks, SHORT_ADDRESS, function(){
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