const elastic = require('./../search_module/elastic'),
    // request = require('./charset'),
    entities = require('entities'),
    u = require('url'),
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
    })

const START_URL = "https://alltor.me",
    SHORT_ADDRESS = "alltor.me",
    SCOPE = 'body@html | decode | replaceLineBreak | whiteSpace',
    SELECTOR = {  
      title: 'h1.maintitle',
      description:'.post_wrap:contains("Скачать бесплатно и на максимальной скорости!")',
      category: ['#main_content table:first-of-type .nav.w100 a:not(:first-child)'],
      pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]:not([href^="magnet:?"]):not([href$=".jpg"]):not([href*="&view="])@href']
    },
    MAX_PAGES_TO_VISIT = 100000;
function condition (obj){
  return  obj.description !== undefined
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

  x(url, SCOPE, SELECTOR)(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      let time = new Date().toISOString();
      
      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
        console.log(obj)
        obj.crawledDate = time;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : "ctx._source.remove('crawled')", upsert: {crawledDate: time }}, callback )       
        );
      } else final()
      
      function final(){
        for (i = 0; i < obj.pageLinks.length; i++) {
          if (!u.parse(obj.pageLinks[i]).hostname.includes(SHORT_ADDRESS)){
            console.log('___________________________' + obj.pageLinks.splice(i, 1));
          }
          if (i >= obj.pageLinks.length - 1 ){
            // console.log(obj);
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