var a = [1, 2, 3, 1, 5, 1, 7, 8, 9, 43, 66, 432, 314, 34, 21, 23,4, 37,8,24, 32,64,4,3,27,84 ,43,27,8,4, 4,3,27,8,4];
var b = [1, 2, 3, 1, 3, 1, 7, 8, 9, 43, 66, 432, 314, 34, 21, 23,4, 37,8,24, 32,64,4,3,27,84 ,43,27,8,4, 4,3,27,8,4];

// function loop(array){
// 	let i = 0
// 	let b = array
// 	inner()
// 	function inner(){
// 		if (b[i]){
// 			console.log(array[i]);
// 			i++
// 			inner()
// 		} else {
// 			console.log('done');
// 		}
// 	}
// }

// loop(a)
// loop(b)

var async = require('async');
async.each(a, function(item, callback){
	console.log(item)
	callback()
}, function(){
	console.log('done')
})

async.each(b, function(item, callback){
	console.log(item)
	callback()
}, function(){
	console.log('done')
})