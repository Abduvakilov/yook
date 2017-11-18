module.exports = start;
function start(START_URL,ENCODING,TARGET,SELECTOR,MAX_PAGES_TO_VISIT){
const elastic = require('../../search_module/elastic'),
  x = require('./xray')(ENCODING),
  SHORT_ADDRESS = (START_URL),
  SCOPE = 'body';
let numPagesVisited = 0,
    url = START_URL;

elastic.nextPages[0] = {_id: url};
crawl()
function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached limit of pages to visit.");
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
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks
      if (obj[TARGET]) {
        console.log('target exists at page ' + url);
        obj.crawledDate = time;
        console.log(obj)

        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
                params : {time : time}
              }}, callback )       
        );
      } else final();
      
      function final(){
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, function(){
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
            params : {time : time}
          }}, callback);
        })
      }
    }
  });
}}