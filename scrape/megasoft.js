const START_URL = "http://megasoft.uz/",
    SELECTOR = {  
    title: '.title',
    description:'body table:nth-child(6) td:nth-child(2) | removeDown | whiteSpace',
    downloadLink: ['a[href^="http://megasoft.uz/get"]@href'],
    publishDate: 'body table[width="300"] tr:nth-child(5) td:nth-child(2) | date',
    pageLinks: ['a[href^="' + START_URL + '"]:not([href^="http://megasoft.uz/get"]):not([href*="?sort"]):not([href*="#"])@href']
  },
  TARGET = 'downloadLink',
  ENCODING = 'windows-1251';

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);