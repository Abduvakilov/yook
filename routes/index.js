var express = require('express');
var router = express.Router();

var search = require('../modules/search');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Поиск в Tas-ix' });
});

router.get('/search', function(req, res) {
	let sq = req.query.search;
	let from = 0;
	if ( !isNaN(parseInt(req.query.startsWith)) ){
		from = parseInt(req.query.startsWith);
	}
	if (sq) {
		search(sq, from, function(error, response) {
			if (error) {
				res.render('error', {message: 'Ошибка', error:{status: '', stack:''}})
			} else {
				res.render('index', { title: 'Поиск в Tas-ix',  query: sq, took:response.took, total: response.total, results: response.res, startsWith: from});
	  		}
	  	});
	} else res.render('index', { title: 'Поиск в Tas-ix' });
});

module.exports = router;
