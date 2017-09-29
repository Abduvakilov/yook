// var elastic = require('../search_module/elastic')
const request = require('../modules/charset'),
options = {
  method: "GET",            //Set HTTP method
  jar: true,              //Enable cookies
  headers: {              //Set headers
    "User-Agent": "Firefox/48.0"
  }
};
makeDriver = require('request-x-ray'),
driver = makeDriver(options);
var Xray = require('x-ray');
var x = Xray({
	filters : {
		whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
		beforeDivTag: function (value){
          return typeof value === 'string' ? value.split('<div')[0] : value
        }
	}
})//.driver(request('windows-1251'), driver);
var fileUrl = 'http://okay.uz/front/home/serial_more/2928';
var SHORT_ADDRESS = 'okay.uz';
const //SCOPE = '.order, .order1, .content',
	serialPage = {
      title: 'table.movie-desc h3',
      description: 'table.movie-desc | whiteSpace',
      pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]:not([href$=".jpg"]):not([href*="/play/"]):not([href*="/get/"])@href']
    }
x(fileUrl, serialPage)
(function(err, obj){
	if (err) console.log(err);
	console.log(obj);
})