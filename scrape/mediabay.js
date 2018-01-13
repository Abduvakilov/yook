let x = require('../modules/scrape/xray')('utf-8'),
  elastic = require('../modules/scrape/elastic6'),
  u = require('url');

const START_URL = "http://mediabay.uz/",
  followLink = ['a[href^="'+ START_URL +'"]:not([href^="http://mediabay.uz/uz/"]):not([href*="?page="]):not([href$=".jpg"]):not([href*="#"])@href'],
  moviePage = {
    title: 'h2.film-descr__header',
    subTitle: 'div.film-descr__meta > div:contains("Слоган") p.film-descr__meta-text',
    img: 'img.film-descr__img@src',
    year: 'div.film-descr__meta > div:contains("Год:") p.film-descr__meta-text',
    quality: 'div.film-descr__meta > div:contains("Качество:") p.film-descr__meta-text | whiteSpace',
    lang: 'div.film-descr__meta > div:contains("Язык:") p.film-descr__meta-text | whiteSpace',
    genre: ['div.film-descr__meta > div:contains("Жанр:") p.film-descr__meta-text span | removeComma | whiteSpace'],
    director: 'div.film-descr__meta > div:contains("Режиссер") p.film-descr__meta-text',
    actor: ['div.film-descr__meta > div:contains("Актеры:") p.film-descr__meta-text a | removeComma | whiteSpace'],
    kinopoisk: 'div.film-descr__meta > div:contains("Кинопоиск:") p.film-descr__meta-text | parseFloat',
    imdb: 'div.film-descr__meta > div:contains("IMDb:") p.film-descr__meta-text | parseFloat',
    budget: 'div.film-descr__meta > div:contains("Бюджет:") p.film-descr__meta-text',
    forAge: 'div.film-descr__meta > div:contains("Возраст:") p.film-descr__meta-text',
    publishDate: 'div.film-descr__meta > div:contains("Дата публикации:") p.film-descr__meta-text | date',
    country: 'div.film-descr__meta-item > div:contains("Страна производитель:") p.film-descr__meta-text',
    description: 'div.film-descr__meta-item > div:contains("Сюжет фильма:") p.film-descr__meta-text',
    pageLinks: followLink
  },
  musicPage = {
    title: 'h2.film-descr__header',
    img: 'img.film-descr__img@src',
    music: ['div.music__name'],
    // x('div.music_in-album .music-item', {
    //   name: 'div.music__name',
    //   link: 'div.music__player-btn a:nth-child(2)@href'
    // }),
    description: 'div.film-descr__middle p',
    pageLinks: followLink
  },
  SHORT_ADDRESS = u.parse(START_URL).hostname,
  SCOPE = 'body',
  MAX_PAGES_TO_VISIT = process.env.max || 10000;
function condition(obj){
  return  obj.title;
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
        if (exists) {
        // We've already visited this page, so repeat the crawl
          crawl();
        }
        // New page we haven't visited
        else {
          if (nextPage.includes('/videos/')) {
            SELECTOR = moviePage;
          } else {
            SELECTOR = musicPage;
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

  x(encodeURI(url), SCOPE, SELECTOR)(function (err, obj) {
    if (err) {
      console.error(err);
      callback();
    } else {     
      let pageLinks = obj.pageLinks;
      delete obj.pageLinks
      if (condition(obj) && !url.includes('page=')) {
        console.log('condition achieved at page ' + url);
        obj.crawledDate = today;
        for (let key in obj) {
          if (obj[key].length==0||obj[key]==null||Number.isNaN(obj[key])) {
            delete obj[key];
          }
        };
        console.log(obj);
        elastic.update("targets", url, {doc:obj, doc_as_upsert : true}, final);
      } else final();
      function final(){
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, false, function(){
          elastic.update("crawled", url, {doc:{crawledDate: today}, doc_as_upsert : true}, callback);
        })
      }
    }
  });
}