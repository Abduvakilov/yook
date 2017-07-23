// var elastic = require('../search_module/elastic')
const request = require('./charset'),
options = {
  method: "GET",            //Set HTTP method
  jar: true,              //Enable cookies
  headers: {              //Set headers
    "User-Agent": "Firefox/48.0"
  }
},
makeDriver = require('request-x-ray'),
driver = makeDriver(options);
var Xray = require('x-ray');
var x = Xray().driver(driver).driver(request('windows-1251'));
var fileUrl = 'http://topmusic.uz/media/pop/betty_who/album-11577.html';
const SCOPE = '.box-mid',
		SELECTOR = {
			artistPage: {
				artist: 'h2',
				genre: 'a.color1',
				clips: x('.clip-box', [{
					name: 'a.clip-name',
					link: 'a.clip-name@href'
				}]),
				singles: x('.block tr', [{
					name: 'span',
					link: 'a.download@href'
				}])
			},
		albumPage: {
			name : 'td:nth-child(2)'
		}
		}
x(fileUrl, SCOPE, SELECTOR)
(function(err, obj){
	console.log(err);
	console.log(obj);
})