const START_URL = "http://www.ttt.uz/",
    TARGET = 'title'
    SELECTOR = {
      title: 'h1.entry-title | decode',
      img: 'img.wp-post-image @src',
      publishDate: 'time.updated',
      tags: ['span.cat-links a | decode'],
      description: 'div.entry-content-wrapper@html | replaceLineBreak | removeTtt | whiteSpace | removeTtt2 | decode',
      pageLinks: ['a[href^="'+ START_URL +'"]:not([href$=".jpg"]):not([href*="#"])@href']
    },
    ENCODING = 'utf-8';
function TRANSFORMATION(obj){
  let arr = obj.description.split('‧');
  obj.publishDate = obj.publishDate.slice(0, 6)+obj.publishDate.slice(8);
  let dictionary = {
    year: ['Год', 'Yil'],
    country: ['Страна', 'Davlat'],
    genre: ['Жанр','Janr'],
    time: ['Время','Davomiyligi'],
    director: ['Режиссер','Rejisyor'],
    actors: ['ролях','Bosh'],
    version: ['Версия'],
    dev: ['Разработчик'],
    lang: ['Язык'],
    tbd: ['Перевод','Про фильм','Tarjima']
  };
  let del = [];
  for (let i=0; i<arr.length; i++) {
    if (arr[i].includes(':')) {
      let arrin = arr[i].split(/:\s(.+)/) // regex to split only to two
      for (let key in dictionary) {
        if ( dictionary[key].some(val=>arrin[0].toUpperCase().includes(val.toUpperCase())) ){
          obj[key] = arrin[1];
          del.push(i);
        }
      }
    };
  };
  for (let i of del) {
    delete arr[i];
  };
  delete obj.tbd;
  obj.description = arr.filter(val => val.trim()!='').join(' ‧').replace(/\.\s\‧/g,'.') || ''
};
require('../modules/scrape')(START_URL,TARGET,SELECTOR,ENCODING,TRANSFORMATION);