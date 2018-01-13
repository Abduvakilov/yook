let x = require('../modules/scrape/xray')('windows-1251'),
  elastic = require('../modules/scrape/elastic6'),
  u = require('url');

const START_URL = "http://topmusic.uz/",
  followLink = ['a[href^="'+ START_URL +'"]:not([href*="download/"]):not([href$=".jpg"]):not([href$=".pls"]):not([href*="play/"]):not([href*="/get/"]):not([href*="#"])@href'],
  artistPage = {
    title: '.box-mid h2',
    genre: '.box-mid a.color1',
    clip: ['.box-mid .clip-box a.play_video@title | remove:"посмотреть  клип  - "'],
    // x('.box-mid .clip-box', [{
    //   name: 'a.clip-name',
    //   link: 'a.clip-name@href'
    // }]),
    single: ['.box-mid .block tr a.play-track@title'], 
    // x('.box-mid .block tr', [{
    //   name: 'span',
    //   link: 'a.download@href'
    // }]),
    pageLinks: followLink
  },
  albumPage = {
    albumName : '.box-mid tr:first-child td:nth-child(2)',
    img: '.box-mid img@src',
    artistName: '.box-mid tr:nth-child(2) td:nth-child(2)',
    genre: '.box-mid tr:nth-child(3) td:nth-child(2)',
    year: '.box-mid tr:nth-child(4) td:nth-child(2) | whiteSpace | parseInt',
    link: 'tr:nth-child(6) td:nth-child(2) a@href',
    song: ['.box-mid .block tr span'],
    // x('.box-mid .block tr', [{
    //   name: 'span',
    //   link: 'a.download@href'
    // }]),
    pageLinks: followLink
  },
  SHORT_ADDRESS = u.parse(START_URL).hostname,
  SCOPE = 'body',
  MAX_PAGES_TO_VISIT = process.env.max || 10000;
function condition(obj){
  return  (SELECTOR === albumPage)||((obj.clip[0] || obj.single[0]) && (obj.title));
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
  

// elastic.nextPages[0] = {_id: url};
elastic.create(url, {crawled:SHORT_ADDRESS}, crawl);

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
        if(url.endsWith('/')) {url2=url.slice(0,-1); elastic.create(url2, {crawledDate:today, crawled:SHORT_ADDRESS})} else url2=url;
        console.log('condition achieved at page ' + url);

        if(obj.single) obj.single=obj.single.map(x=> x.replace(obj.title+' - ', ''));
        if(obj.artistName) obj.artistName=obj.artistName.trim();
        if(obj.song) obj.song=obj.song.map(x=> x.replace(obj.artistName+' - ', ''));

        obj.crawledDate = today;
        for (let key in obj) {
          if (obj[key].length==0||obj[key]==null||Number.isNaN(obj[key])) {
            delete obj[key];
          }
        };
        console.log(obj);
        elastic.update("targets", url2, {doc:obj, doc_as_upsert : true}, final);
      } else final();
      function final(){
        elastic.linksToVisit(pageLinks, SHORT_ADDRESS, false, function(){
          elastic.update("crawled", url, {doc:{crawledDate: today}, doc_as_upsert : true}, callback);
        })
      };
    }
  });
};