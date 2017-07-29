const elastic = require('./../search_module/elastic'),
    // request = require('./charset'),
    entities = require('entities'),
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
        }
      }
    })//.driver(driver) 

const START_URL = "https://alltor.me",
    SHORT_ADDRESS = "alltor.me",
    MAX_PAGES_TO_VISIT = 100000;

let numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: SHORT_ADDRESS}, doc_as_upsert : true}, crawl);

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

  x(url, 'body@html | decode | replaceLineBreak | whiteSpace')(function (error, init) {
    if (error) {
      console.error(error);
      callback();
    } else {
      x(init, {  
        title: 'h1.maintitle',
        description:'.post_wrap:contains("Скачать бесплатно и на максимальной скорости!")',
        category: ['#main_content table:first-of-type .nav.w100 a:not(:first-child)'],
        pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]:not([href^="magnet:?"]):not([href$=".jpg"]):not([href*="&view="])@href']
      })(function (err, obj) {
        if (err) {
          console.error(err);
          callback();
        } else {
          console.log(obj);
          let time = new Date().toISOString();    
          
          if (obj.description !== undefined) {
            console.log(obj);
            console.log('description found at page ' + url);
            obj.crawledDate = time;
            elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
              elastic.update("crawled", url, {script : "ctx._source.remove('crawled')", upsert: {crawledDate: time }}, callback )       
            );
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
    }
  })
};