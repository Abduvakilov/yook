// var elastic = require('../search_module/elastic')
const request = require('../modules/charset'),
options = {
  method: "GET",            //Set HTTP method
  jar: true,              //Enable cookies
  headers: {              //Set headers
    "User-Agent": "Firefox/48.0",

  }
};
makeDriver = require('request-x-ray'),
driver = makeDriver(options);
var Xray = require('x-ray');
var x = Xray({
	filters : {
    parseFloat: function (value){
      return typeof value === 'string' ? parseFloat(value) : value
    }
	}
}).driver(request('windows-1251'), driver);
var fileUrl = 'http://player.uz/5172/';
var SHORT_ADDRESS = 'okay.uz';
const //SCOPE = '.order, .order1, .content',
    moviePage = {
      title: 'div.poster img@title',
      img: 'div.poster img@src',
      year: 'div.description div.clear :nth-child(2) | parseFloat',
      country: 'div.description div.clear :nth-child(4)',
      genre: ['div.description div.clear :nth-child(6) a'],
      forAge: 'div.description div.clear :nth-child(8)',
      rating: 'div.description #average | parseFloat',
      rateCount: 'div.description #rate-count',
      imdb: 'p.imdb-value | parseFloat',
      kinopoisk: 'p.kinopoisk-value | parseFloat',
      description: 'div.description .story p',
    };
let i=0;
function start() {
x(fileUrl, moviePage)
(function(err, obj){
  i++
  console.log('connection ' + i)
	if (err) console.log(err);
	console.log(obj);
  if (i<1000){start()}

})
}
start()
