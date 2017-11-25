let x = require('../modules/scrape/xray')('windows-1251'),
  elastic = require('../search_module/elastic6'),
  u = require('url');

const START_URL = "http://topmusic.uz/",
  followLink = ['a[href^="'+ START_URL +'"]:not([href*="download/"]):not([href$=".jpg"]):not([href*="play/"]):not([href*="/get/"]):not([href*="#"])@href'],
  artistPage = {
    artist: x('.box-mid', {
      artist: 'h2',
      genre: 'a.color1',
      clips: x('.clip-box', [{
        name: 'a.clip-name',
        link: 'a.clip-name@href'
      }]),
      singles: x('.block tr', [{
        name: 'span',
        link: 'a.download@href'
      }]),
    }),
    pageLinks: followLink
  },
  albumPage = {
    album: x('.box-mid', {
      name : 'tr:first-child td:nth-child(2)',
      artist: 'tr:nth-child(2) td:nth-child(2)',
      genre: 'tr:nth-child(3) td:nth-child(2)',
      year: 'tr:nth-child(4) td:nth-child(2) | whiteSpace | parseInt',
      link: 'tr:nth-child(6) td:nth-child(2) a@href',
      songs: x('.block tr', [{
        name: 'span',
        link: 'a.download@href'
      }]),
    }),
    pageLinks: followLink
  },
  SHORT_ADDRESS = u.parse(START_URL).hostname,
  SCOPE = 'body',
  MAX_PAGES_TO_VISIT = process.env.max || 10000;
function condition(obj){
  if (SELECTOR === albumPage) {return true} else {
  return  (((obj.artist.clips[0]) || (obj.artist.singles)) && (obj.artist.artist))};
};

let SELECTOR = {},
    numPagesVisited = 0,
    url = START_URL,
    reindex = false;
let date = new Date(),
    month = date.getMonth() + 1;
month = (month < 10 ? "0" : "") + month;
let day  = date.getDate();
day = (day < 10 ? "0" : "") + day;
let today = day + '.' + month + '.' + (date.getYear()-100);
  

elastic.nextPages[0] = {_id: url};
crawl();
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
          if (nextPage.includes('/album-')) {
            SELECTOR = albumPage;
          } else {
            SELECTOR = artistPage;
          }
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
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks
      if (condition(obj)) {
        console.log('condition achieved at page ' + url);
        obj.crawledDate = today;
        console.log(obj)

        elastic.update("targets", url, {doc:obj, doc_as_upsert : true},
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
                params : {time : today}
              }}, final )       
        );
      } else final();
      
      function final(){
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, false, function(){
          elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
            params : {time : today}
          }}, callback);
        })
      }
    }
  });
}