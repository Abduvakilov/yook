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
    })

const START_URL = "http://mytube.uz/",
    MAX_PAGES_TO_VISIT = 1000000;

let numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: false}, doc_as_upsert : true}, crawl() );

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
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
    title: 'h2',
    description:'#aboutUser pre | whiteSpace',
    videoLink: 'a[href*=".mp4"]@href',
    categories: '.userinfobox-categories-tags-container a:nth-child(1) | whiteSpace',
    tags: ['.userinfobox-categories-tags-container a:not(:nth-child(1)) | whiteSpace'],
    pageLinks: ['a[href*="mytube.uz"]@href']
  })(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      console.log(obj)
      let time = elastic.getDateTime();      
      
      if (obj.videoLink !== undefined && url.startswith(START_URL)) {
        console.log(obj);
        console.log('video found at page ' + url);
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