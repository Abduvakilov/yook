const START_URL = "https://allmovies.uz/",
    TARGET = 'title'
    SELECTOR = {
      title: 'div#desc h1.title',
      subTitle: 'div#desc h2.title_orig',
      img: 'div.pic img@src',
      year: 'div#desc div.year | parseFloat',
      country: 'div#desc div.countries',
      genre: ['div#desc div.genres a'],
      director: ['table.details tr:contains("Режиссер") td a'],
      budget: 'table.details tr:contains("Бюджет") td',
      producer: ['table.details tr:contains("Продюсеры") td a'],
      actors: ['table.details tr:contains("В ролях") td a'],
      forAge: 'div#desc div.age',
      imdb: 'div.ratings > div.rating:contains("IMDb") div.rate | parseFloat',
      kinopoisk: 'div.ratings > div.rating:contains("Кинопоиск") div.rate | parseFloat',
      description: 'div#desc div.desc',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"]):not([href*="/search?"]):not([href*="sort="])@href']
    },
    ENCODING = 'utf-8',

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);