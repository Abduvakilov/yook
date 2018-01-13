const START_URL = "https://mover.uz/",
    TARGET = 'category',
    SELECTOR = {  
      title: '.fl.video-title | whiteSpace | decode',
      description: 'div.desc-text | decode | whiteSpace | removeSpoiler',
      views: 'span.fr.views | parseInt',
      likes: 'table.r-desc td.like@html | parseInt',
      dislikes: 'table.r-desc td.dislike@html | parseInt',
      category: 'p.cat-date a | decode',
      publishDate: 'p.cat-date@html | afterATag | decode | whiteSpace | date',
      tags: ['p.tags a | decode'],
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"])@href']
    },
    ENCODING = 'utf-8';

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);