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
var fileUrl = 'http://mytube.uz';
var SHORT_ADDRESS = 'mytube.uz';
const SCOPE = '.order, .order1, .content',
	SELECTOR = {  
      title: 'h2',
      description:'#aboutUser pre | whiteSpace',
      // videoLink: 'a[href*=".mp4"]@href',
      category: '.userinfobox-categories-tags-container a:first-child | whiteSpace',
      tags: ['.userinfobox-categories-tags-container a:not(:first-child) | whiteSpace'],
      pageLinks: ['a[href*="'+ SHORT_ADDRESS +'"]@href']
    }
x(fileUrl, SELECTOR)
(function(err, obj){
	if (err) console.log(err);
	console.log(obj);
})