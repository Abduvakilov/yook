// var elastic = require('../search_module/elastic')
// const request = require('./charset'),
// options = {
//   method: "GET",            //Set HTTP method
//   jar: true,              //Enable cookies
//   headers: {              //Set headers
//     "User-Agent": "Firefox/48.0"
//   }
// };
// makeDriver = require('request-x-ray'),
// driver = makeDriver(options);
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
});//.driver(driver);//.driver(request('windows-1251'));
var fileUrl = 'http://okay.uz/front/home/music_albom/59';
const SCOPE = '.order, .order1, .content',
	SELECTOR = {
		artist : 'h3.title@html | beforeDivTag | whiteSpace',
		clips : x('.clips p', [{
			name: 'a',
			link: 'a@href'
		}]),
		singles : x('.audio li', [{
			name: 'p',
			link: '.download@href'
		}])
	}
x(fileUrl, SCOPE, SELECTOR)
(function(err, obj){
	if (err) console.log(err);
	console.log(obj);
})