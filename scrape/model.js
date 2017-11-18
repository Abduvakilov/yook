const START_URL = "http://player.uz/",
    ENCODING = 'windows-1251',
    TARGET = 'title'
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
    },
    MAX_PAGES_TO_VISIT = process.env.max ? process.env.max : 143;

var start = require('../modules/scrape');

start(START_URL,ENCODING,TARGET,SELECTOR,MAX_PAGES_TO_VISIT);