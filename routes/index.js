var express = require('express');
var router = express.Router();

var search = require('../search_module/search');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Поиск в Tas-ix' });
});

router.get('/search', function(req, res) {
	let searchTerm = req.query.searchTerm;
	let from = 0;
	if ( !isNaN(parseInt(req.query.startsWith)) ){
		from = parseInt(req.query.startsWith);
	}
	if (searchTerm !== '') {
		search(searchTerm, from, function(data) {
			res.render('index', { title: 'Поиск в Tas-ix',  query: searchTerm, took:data.took, total: data.hits.total, results: data.hits.hits, startsWith: from});
	  	});
	} else res.render('index', { title: 'Поиск в Tas-ix' });
});

module.exports = router;
