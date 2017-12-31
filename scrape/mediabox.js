const START_URL = "http://mediabox.uz/ru",
    TARGET = 'title'
    SELECTOR = {
      title: 'p.inner_title',
      img: 'div.cover img@src',
      release: 'div#info td:contains("Год:") ~ td',
      country: 'div#info td:contains("Страна:") ~ td',
      genre: 'div#info td:contains("Жанр:") ~ td',
      subtitle: 'div#info tr:contains("Слоган:") ~ td',
      budget: 'div#info td:contains("Бюджет:") ~ td',
      producers: 'div#info td:contains("Продюсер:") ~ td',
      director: 'div#info td:contains("Режиссёр:") ~ td',
      actors: 'div#info td:contains("Актеры:") ~ td',
      lang: 'div#info td:contains("Язык:") ~ td',
      forAge: 'div#info tr:contains("Возраст:") ~ td b',
      time: 'div#info td:contains("Время:") ~ td',
      description: 'div#descripton | whiteSpace',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"])@href']
    },
    ENCODING = 'utf-8';

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);