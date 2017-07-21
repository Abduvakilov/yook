// var elastic = require('../search_module/elastic')
const request = require('./charset'),
options = {
  method: "GET",            //Set HTTP method
  jar: true,              //Enable cookies
  headers: {              //Set headers
    "User-Agent": "Firefox/48.0"
    // cookie: ["bb_data=a%3A3%3A%7Bs%3A2%3A%22uk%22%3Bs%3A12%3A%22Am02x2osQBjQ%22%3Bs%3A3%3A%22uid%22%3Bi%3A45518%3Bs%3A3%3A%22sid%22%3Bs%3A20%3A%22na1pTsr1t0xWPewUDmSD%22%3B%7D; bb_t=a%3A1%3A%7Bi%3A115729%3Bi%3A1499880881%3B%7D; smart_top=1"]
  }
},
makeDriver = require('request-x-ray'),
driver = makeDriver(options);    //Create driver
console.log(request);
var Xray = require('x-ray');
var x = Xray().driver(driver).driver(request('windows-1251'));
// var u = require('url')
var urr = 'https://connect.mail.ru/share?share_url=https://mover.uz/watch/APobtSzm/'
var fileUrl = 'http://topmusic.uz'
var SHORT_ADDRESS = 'mover.uz'
// console.log(u.parse(fileUrl).hostname.includes(SHORT_ADDRESS))
// var i = 0
// function a(){
// 	i++;
// 	elastic.checkUrl(fileUrl, function(){console.log('fail')}, function(){
// 		console.log(fileUrl)
		x(fileUrl, 'tr', [{a: 'a',
					href: 'a@href'
				}])
		(function(err, obj){
			console.log(err)
			console.log(obj)
			// console.log(i)
			// if (i<100){
			// 	a();
			// }
			// return;
		})
// 	});
// }
// a();

// request.end();
// url = 'https://alltor.me/viewforum.php?f=227'
// elastic.update("crawled", url, {script : {inline : "ctx._source.remove('crawled'); ctx._source.crawledDate = params.time",
// 	params : {time : time}
// }})       

// var s = ' 45 jkhijhuyhbh jhhg jh ghj '
// var st = s.match(/\d+/)[0];
// console.log(st>8)