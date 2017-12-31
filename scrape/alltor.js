const START_URL = "https://alltor.me/",
    TARGET = 'description',
    SELECTOR = {  
      title: 'h1.maintitle',
      description: '.post_wrap:contains("Скачать бесплатно и на максимальной скорости!")@html | replaceLineBreak | removeTags | decode | whiteSpace | deleteDownload',
      category: ['#main_content table:first-of-type .nav.w100 a:not(:first-child)'],
      publishDate: 'div.post_head | whiteSpace | date',
      //editDate: '.last_edited | getBraces | whiteSpace | date',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href^="https://alltor.me/download.php"]):not([href^="https://alltor.me/privmsg.php"]):not([href^="https://alltor.me/profile.php"]):not([href^="magnet:?"]):not([href$=".jpg"]):not([href$=".png"]):not([href*="&view="]):not([href*="#"])@href']
    },
    ENCODING = 'utf-8';

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);