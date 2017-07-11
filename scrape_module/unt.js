var Xray = require('x-ray');
var fs = require('fs');
var x = Xray();
x('http://megasoft.uz', {
	title: 'title',
    description: ['p'],
    downloadLink: ['a[href^="http://megasoft.uz/get"]@href']	
})(function(err, obj){
    console.log(obj)
	// var json = JSON.stringify(obj);
    // fs.writeFile('myj.json', json, 'utf-8', function(error){if(error){console.log(error)}});
});