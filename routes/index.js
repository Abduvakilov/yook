var express = require('express');
var router = express.Router();

var search = require('../modules/search');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/search', function(req, res) {
	let sq = req.query.search.trim();
	let from = 0;
	if ( !isNaN(parseInt(req.query.startsWith)) ){
		from = parseInt(req.query.startsWith);
	}
	if (sq) {
		var useragent = req.headers['user-agent'];
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		search.search(sq, from, function(error, response) {
			var isError = false
			if (error) {
				res.render('error', {message: 'Ошибка', error:{status: error.status, stack:error.stack}})
				isError = true 
			} else {
				res.render('search', { query: sq, took:response.took, total: response.total, results: response.res, startsWith: from});
	  		}
			res.on('finish', function(){
				search.log(isError?'errorlog':'searchlog', sq, useragent, ip)
			});
	  	});
	} else res.render('index');
});

module.exports = router;
