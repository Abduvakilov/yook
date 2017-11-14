const START_URL = "http://player.uz/",
    SHORT_ADDRESS = "player.uz",
    MAX_PAGES_TO_VISIT = 143,
    SCOPE = 'body',
    ENCODING = 'windows-1251',
    SELECTOR = {
      title: 'div.poster img@title',
      img: 'div.poster img@src',
      year: 'div.description div.clear :nth-child(2) | parseFloat',
      country: 'div.description div.clear :nth-child(4)',
      genre: ['div.description div.clear :nth-child(6) a'],
      forAge: 'div.description div.clear :nth-child(8)',
      rating: 'div.description #average | parseFloat',
      rateCount: 'div.description #rate-count',
      imdb: 'p.imdb-value | parseFloat',
      kinopoisk: 'p.kinopoisk-value | parseFloat',
      description: 'div.description .story p',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"]):not([href*="?season="]):not([href*="?cpage="]):not([href*="?stuffers"])@href']
    };
function condition(obj){
  return  (obj.title !== undefined);
};

const elastic = require('./../search_module/elastic'),
    x = require('../modules')(ENCODING);

let numPagesVisited = 0,
    url = START_URL;

elastic.nextPages[0] = {_id: url};
crawl();
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
      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
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
}