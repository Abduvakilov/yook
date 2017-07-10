var Xray = require('x-ray');
var fs = require('fs');
var request = require('./1251');
var x = Xray().driver(request('windows-1251'));
x('http://megasoft.uz/soft/security/antiviruses/2285.html', {
	title: '.title',
    description: ['p'],
    downloadLink: ['a[href^="http://megasoft.uz/get"]@href']	
})(function(err, obj){
	var json = JSON.stringify(obj);
    fs.writeFile('myj.json', json, 'utf-8', function(error){if(error){console.log(error)}});
});