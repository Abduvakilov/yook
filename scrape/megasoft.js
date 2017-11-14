const 
    elastic = require('./../search_module/elastic'),
    request = require('../modules/charset'),
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        date: function (value) {
          return typeof value === 'string' ? elastic.moment(value, 'DD MMMM YYYY', 'ru').toISOString() : value
        },
        removeDown: function (value) {
          return typeof value === 'string' ? value.replace('Скачать этот файл', '') : value
        }
      }
    }).driver(request('windows-1251'));

const START_URL = "http://megasoft.uz/",
    SHORT_ADDRESS = "megasoft.uz",
    MAX_PAGES_TO_VISIT = 2200,
    reindex = false;

let numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: SHORT_ADDRESS}, doc_as_upsert : true}, crawl );

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    // var json = JSON.stringify(targets);
    // fs.writeFile('megasoft.json', json, 'utf-8', function(error){if(error){console.error(error); return}});
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
          visitPage(nextPage, crawl);

        }
      })
    } else console.log('no nextPage')
  })
}

function visitPage(url, callback) {
  numPagesVisited++;
  console.log("Visiting page " + numPagesVisited + ': ' + url);

  x(url, {  
    title: '.title',
    description:'body table:nth-child(6) td:nth-child(2) | removeDown | whiteSpace',
    downloadLink: ['a[href^="http://megasoft.uz/get"]@href'],
    publishDate: 'body table[width="300"] tr:nth-child(5) td:nth-child(2) | date',
    pageLinks: ['a[href^="' + START_URL + '"]:not([href^="http://megasoft.uz/get"]):not([href*="?sort"]):not([href*="#"])@href']
  })(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
          
      let time = new Date().toISOString();
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks

      if (obj.downloadLink.length !== 0) {
        console.log('downloadLink found at page ' + url);
        console.log(obj)
        obj.crawledDate = time;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true}, final);
      } else final();
      
      function final(){      
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, function(){
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
            params : {time : time}
          }}, callback, reindex);
        });
      }
    }
  });
}