const 
    elastic = require('./../search_module/elastic'),
    request = require('./charset'),
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        }
      }
    }).driver(request('windows-1251'));

const START_URL = "http://megasoft.uz/",
    MAX_PAGES_TO_VISIT = 1000000;

let numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: false}, doc_as_upsert : true}, crawl() );

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    // var json = JSON.stringify(targets);
    // fs.writeFile('megasoft.json', json, 'utf-8', function(error){if(error){console.error(error); return}});
    return;
  }
  elastic.nextPage(function(nextPage){

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
    description:'body table:nth-child(6) td:nth-child(2) | whiteSpace',
    downloadLink: ['a[href^="http://megasoft.uz/get"]@href'],
    pageLinks: ['a[href^="' + START_URL + '"]:not([href^="http://megasoft.uz/get"]):not([href*="?sort"])@href']
  })(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      
      let time = elastic.getDateTime();      
      
      if (obj.downloadLink) {
        console.log('downloadLink found at page ' + url);
        obj.crawledDate = time;
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true}, final());
      } else final()
      
      function final(){      
        elastic.linksToVisit(obj.pageLinks, function(){
          elastic.update("crawled", url, {doc: {crawled: true, crawledDate: time }, doc_as_upsert : true}, callback() )       
        })
      }
    }
  });;
};