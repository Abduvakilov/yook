const moment = require('moment');

function format(date, isDayFirst){
	let form = 'YYYY-MM-DD';
	if (isDayFirst) form = 'DD-MM-YYYY';
	let dictionary = {
		'Сегодня' : moment().format(form),
		'Вчера': moment().subtract(1, 'days').format(form)
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
function finalize(date, isDayFirst) {
	if (isDayFirst) {
		return moment(format(date, isDayFirst), 'DD-MMMM-YYYY hh:mm', 'ru').format()
	} else {
		return moment(format(date, isDayFirst), 'YYYY-MM-DD hh:mm').format()
	}
}
// console.log(finalize('22 сентября 2017 г.', true))
module.exports = finalize