const elastic = require('./../search_module/elastic'),
    u = require('url'),
    Xray = require('x-ray'),
    x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        replaceLineBreak: function (value) { 
          return typeof value === 'string' ? value.replace(/\<br\>/g, ';;') : value
        },
        afterATag: function (value){
          return typeof value === 'string' ? value.split('</a>')[1] : value
        },
        parseInt: function (value){
          return typeof value === 'string' ? parseInt(value) : value
        }
      }
    });

const START_URL = "http://okay.uz/",
    SHORT_ADDRESS = "okay.uz",
    MAX_PAGES_TO_VISIT = 100000,
    SCOPE = 'body',
    followLink = ['a[href^="'+ START_URL +'"]:not([href*="_download/"]):not([href$=".jpg"]):not([href*="play/"]):not([href*="/get/"])@href'],
    artistPage = {
      artist: x('.box-mid', {
        artist: 'h2', //artist
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
        title : 'tr:first-child td:nth-child(2)',
        artist: 'tr:nth-child(2) td:nth-child(2)',
        genre: 'tr:nth-child(3) td:nth-child(2)',
        year: 'tr:nth-child(4) td:nth-child(2) | whiteSpace | parseInt',
        link: 'tr:nth-child(6) td:nth-child(2) a@href',
        songs: x('.block tr', [{
          title: 'span',
          link: 'a.download@href'
        }]),
      }),
      pageLinks: followLink
    },
    moviePage = {
      title: 'table.movie-desc h3',
      description: 'table.movie-desc | whiteSpace',
      pageLinks: followLink
    };
    
function condition(obj){
  if (SELECTOR != artistPage ) {return true} else {;
  return  obj.artist.genre !== undefined};
};

let SELECTOR = {},
    numPagesVisited = 0,
    url = START_URL;

elastic.update("crawled", START_URL, {doc: {crawled: SHORT_ADDRESS}, doc_as_upsert : true}, crawl );

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
          } else if (nextPage.includes('/serial_more/') || nextPage.includes('/kino_more/')) {
            SELECTOR = moviePage;
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
        for (i = 0; i < pageLinks.length; i++) {
          if (!u.parse(pageLinks[i]).hostname.includes(SHORT_ADDRESS)){
            console.log('___________________________' + pageLinks.splice(i, 1));
          }
          if (i >= pageLinks.length - 1 ){
            elastic.linksToVisit(pageLinks, SHORT_ADDRESS, function(){
              elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
                params : {time : time}
              }}, callback)
            })
          }
        }
      }
    }
  });
}