const START_URL = "http://itv.uz/",
    TARGET = 'title'
    SELECTOR = {
      title: 'div.chanel-description-info h4',
      subTitle: 'div.chanel-description-info p',
      img: 'div.channel-description-block img@src',
      year: 'div.chanel-description-info > p:nth-child(9) | afterColon | parseFloat',
      country: 'div.chanel-description-info > p:nth-child(10) | whiteSpace | decode | afterColon',
      genre: 'div.chanel-description-info > p:nth-child(11) | whiteSpace | decode | afterColon | toArray',
      directors: 'div.chanel-description-info > p:nth-child(12) | whiteSpace | decode | afterColon | toArray',
      screenwriters: 'div.chanel-description-info > p:nth-child(13) | whiteSpace | decode | afterColon | toArray',
      producers: 'div.chanel-description-info > p:nth-child(14) | whiteSpace | decode | afterColon | toArray',
      actors: 'div.chanel-description-info > p:nth-child(15) | whiteSpace | decode | afterColon | toArray',
      forAge: 'div.chanel-description-info div.age_kp',
      imdb: 'div.imdb-badge | parseFloat',
      kinopoisk: 'div.kinopoisk-badge | parseFloat',
      description: 'div.chanel-description-info > :nth-child(8) | decode',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"])@href']
    },
    MAX_PAGES_TO_VISIT = process.env.max || 1000,
    ENCODING = null; //enables phantom
    
require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);