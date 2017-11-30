const START_URL = "http://mytube.uz/",
    TARGET = 'category',
    SELECTOR = {
      title: 'h2',
      description:'#aboutUser pre | whiteSpace',
      views: '.Views-Container | parseInt',
      publishDate: '.Date | date',
      // videoLink: 'a[href*=".mp4"]@href',
      category: '.userinfobox-categories-tags-container a:first-child | whiteSpace',
      tags: ['.userinfobox-categories-tags-container a:not(:first-child) | whiteSpace'],
      pageLinks: ['a[href*="mytube.uz"]:not([href*="mytube.uz/uz/"]):not([href*="mytube.uz/oz/"]):not([href*="#"])@href']
    },
    ENCODING = 'utf-8';

require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING);