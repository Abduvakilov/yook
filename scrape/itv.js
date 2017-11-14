const START_URL = "http://itv.uz/",
    SHORT_ADDRESS = "itv.uz",
    MAX_PAGES_TO_VISIT = 2000,
    SCOPE = 'body',
    ENCODING = 'utf-8',
    PHANTOM_ENABLED = true,
    SELECTOR = {
      title: 'div.chanel-description-info h4',
      subTitle: 'div.chanel-description-info p',
      img: 'div.channel-description-block img@src',
      year: 'div.chanel-description-info > p:nth-child(9) | afterColon | parseFloat',
      country: 'div.chanel-description-info > p:nth-child(10) | whiteSpace | decode | afterColon',
      genre: 'div.chanel-description-info > p:nth-child(11) | whiteSpace | decode | afterColon | toArray',
      directors: 'div.chanel-description-info > p:nth-child(12) | whiteSpace | decode | afterColon | toArray',
      screenwriters: 'div.chanel-description-info > p:nth-child(13) | whiteSpace | decode | afterColon | toArray',
      producers: 'div.chanel-description-info > p:nth-child(14) | whiteSpace | decode | afterColon | toArray',
      actors: 'div.chanel-description-info > p:nth-child(15) | whiteSpace | decode | afterColon | toArray',
      forAge: 'div.chanel-description-info div.age_kp',
      imdb: 'div.imdb-badge | parseFloat',
      kinopoisk: 'div.kinopoisk-badge | parseFloat',
      description: 'div.chanel-description-info > :nth-child(8) | decode',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"])@href']
    };
function condition(obj){
  return  (obj.title !== undefined);
};

const elastic = require('./../search_module/elastic'),
    x = require('../modules')(ENCODING, PHANTOM_ENABLED);

// x(START_URL, SCOPE, SELECTOR)(function(err, obj){console.log(obj)})
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
              }}, final )       
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