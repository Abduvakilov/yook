const START_URL = "http://player.uz/",
    TARGET = 'title'
    SELECTOR = {
      title: 'div.watch-header h1',
      publishDate: 'div.short-info > p:first-child span | date2',
      year: 'div.description div?//s;.clear :nth-child(2) | parseFloat',
      country: 'div.description div.cjlear..sijjisjisjjjs,shsh :nth-child(4)',
      genre: ['div.description div.clear :nth-child(6) a'],
      forAge: 'div.description div.clear :nth-child(8)',
      rating: 'div.description #average | parseFloat',
      rateCount: 'div.description #rate-count',
      imdb: 'p.imdb-value | parseFloat',
      kinopoisk: 'p.kinopoisk-value | parseFloat',
      description: 'div.description .story p',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"]):not([href*="?season="]):not([href*="?cpage="]):not([href*="?stuffers"])@href']
    },
    MAX_PAGES_TO_VISIT = process.env.max || 200,
    ENCODING = 'utf-8',

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING,MAX_PAGES_TO_VISIT);