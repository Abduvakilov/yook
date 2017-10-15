const elastic = require('./../search_module/elastic'),
    // request = require('../modules/charset'),
    entities = require('entities'),
    u = require('url'),
    moment = require('moment'),
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
        removeSpoiler: function (value) {
          return typeof value === 'string' ? value.replace('свернуть развернуть', '') : value
        },
        afterATag: function (value){
          return typeof value === 'string' ? value.split('</a>')[1] : value
        },
        parseInt: function (value){
          return typeof value === 'string' ? parseInt(value) : value
        },
        date: function (value) {
          return typeof value === 'string' ? moment(value, 'DD MMMM YYYY', 'ru').format() : value
        }
      }
    });

const START_URL = "https://mover.uz",
    SHORT_ADDRESS = "mover.uz",
    MAX_PAGES_TO_VISIT = 100000,
    SCRAPE_OBJECT = {  
      title: '.fl.video-title | whiteSpace | decode',
      description: 'div.desc-text | decode | whiteSpace | removeSpoiler',
      views: 'span.fr.views | parseInt',
      likes: 'table.r-desc td.like@html | parseInt',
      dislikes: 'table.r-desc td.dislike@html | parseInt',
      category: 'p.cat-date a | decode',
      publishDate: 'p.cat-date@html | afterATag | decode | whiteSpace | date',
      tags: ['p.tags a | decode'],
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"])@href']
    };
function condition (obj){
  return  !isNaN(obj.views);
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
      let time = new Date().toISOString();
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks

      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
        console.log(obj);
        obj.crawledDate = time;
        obj.site = SHORT_ADDRESS;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : "ctx._source.remove('crawled')", upsert: {crawledDate: time }}, final )       
        );
      } else final()
      
      function final(){
        for (i = 0; i < pageLinks.length; i++) {
          if (!u.parse(pageLinks[i]).hostname.includes(SHORT_ADDRESS)){
            console.log('___________________________' + pageLinks.splice(i, 1));
          }
          if (i >= pageLinks.length - 1 ){
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