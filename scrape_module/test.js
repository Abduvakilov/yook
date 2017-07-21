// var elastic = require('../search_module/elastic')
var Xray = require('x-ray');
var x = Xray()
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