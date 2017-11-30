//const elastic = require('./../search_module/elastic'),
    //request = require('./charset'),
    const options = {
      method: "GET",            //Set HTTP method
      jar: true,              //Enable cookies
      headers: {              //Set headers
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
        // cookie: "bb_data=a%3A3%3A%7Bs%3A2%3A%22uk%22%3Bs%3A12%3A%22Am02x2osQBjQ%22%3Bs%3A3%3A%22uid%22%3Bi%3A45518%3Bs%3A3%3A%22sid%22%3Bs%3A20%3A%22na1pTsr1t0xWPewUDmSD%22%3B%7D; bb_t=a%3A1%3A%7Bi%3A115729%3Bi%3A1499880881%3B%7D; smart_top=1"
      }
    },
    makeDriver = require('request-x-ray'),
    driver = makeDriver(options),    //Create driver
    entities = require ('entities');
     Xray = require('x-ray')
    var x = Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        decode: function (value) {
          return typeof value === 'string' ? entities.decodeHTML(value) : value
        }
      }
    }).driver(driver) 

x('https://alltor.me/viewtopic.php?t=115082', ['span | decode'] 
// {
	// title: ['a']
	// link: '[href*="download.php"]@href'
// }
)(function(err, obj){
	if(err) console.log(err); else console.log(obj);
	// var json = JSON.stringify(obj);
    // fs.writeFile('myj.json', json, 'utf-8', function(error){if(error){console.log(error)}});
})

