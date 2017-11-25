const START_URL = "http://player.uz",
    TARGET = 'title',
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
    ENCODING = 'windows-1251';
  
  require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);