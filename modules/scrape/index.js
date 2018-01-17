module.exports = start;
function start(START_URL,TARGET,SELECTOR,ENCODING,TRANSFORMATION){
let elastic = require('./elastic6'),
  x = require('./xray')(ENCODING),
  SHORT_ADDRESS = require('url').parse(START_URL).hostname,
  SCOPE = 'body',
  MAX_PAGES_TO_VISIT = process.env.max || 10000;
let numPagesVisited = 0,
    url = START_URL;
let date = new Date(),
  month = date.getMonth() + 1;
month = (month < 10 ? "0" : "") + month;
let day  = date.getDate();
day = (day < 10 ? "0" : "") + day;
let today = day + '.' + month + '.' + (date.getYear()-100);
    
elastic.nextPages.push({_id: url});
elastic.create(url, {crawled:SHORT_ADDRESS}, //crawl
  function(){
  visitPage(url, crawl)
}
);
function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached limit of pages to visit.");
    return;
  }
  elastic.nextPage(SHORT_ADDRESS, function(nextPage){
    if (nextPage){
      // console.log(nextPage)
      elastic.exists(nextPage, function(exists){
        if (exists) {
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

  x(encodeURI(url), SCOPE, SELECTOR)(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks;
      if (typeof obj[TARGET] === 'object' && obj[TARGET] !== null ? obj[TARGET].length > 0 : obj[TARGET] && !url.includes('page=')) {
        console.log('target exists at page ' + url);
        if(TRANSFORMATION!=null){
          TRANSFORMATION(obj);
        };
        obj.crawledDate = today;
        obj.site = SHORT_ADDRESS;
        for (let key in obj) {
          if (obj[key]==null||obj[key].length==0||Number.isNaN(obj[key])) {
            delete obj[key];
          }
        };
        console.log(obj);
        let bulk = [];
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true}, final);
      } else final();
      function final(){
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, false, function(){
          elastic.update("crawled", url, {doc:{crawledDate: today, isTarget:obj.site!=null}, doc_as_upsert : true}, callback);
        })
      }
    }
  });
}}