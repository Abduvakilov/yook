const moment = require('moment');

function format(date){
	let dictionary = {
		'Сегодня' : moment().format('YYYY-MM-DD'),
		'asdfas': 'dfsfds',
		'fsafdag': 'fdgdsg'
	}
	let words = date.split(' ');
	let result = '';
	for (n in words){
		for (abc in dictionary) {
			if (abc===words[n]) {
				words[n] = dictionary[abc];
			}
		}
		result = result + words[n]+ ' ';
	}
	return result
}	
module.exports = format()