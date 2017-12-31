const START_URL = "http://player.uz",
    TARGET = 'title',
    SELECTOR = {
      title: 'div.poster img@title | decode',
      img: 'div.poster img@src',
      year: 'label:contains("Год выпуска") ~ p | parseFloat',
      country: 'label:contains("Страна") ~ p',
      genre: 'label:contains("Жанр") ~ p',
      forAge: 'label:contains("Возрастное ограничение") ~ p',
      rating: 'div.description #average | parseFloat',
      rateCount: 'div.description #rate-count',
      imdb: 'p.imdb-value | parseFloat',
      kinopoisk: 'p.kinopoisk-value | parseFloat',
      description: 'div.description .story p',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"]):not([href*="?season="]):not([href*="?cpage="]):not([href*="?stuffers"])@href']
    },
    ENCODING = 'windows-1251';
  
  require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);