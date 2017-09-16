var express = require('express');
var router = express.Router();

var search = require('../search_module/search');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Поиск в Tas-ix' });
});

router.get('/search', function(req, res) {
	let searchTerm = req.query.searchTerm;
	if (searchTerm !== '') {
		search(searchTerm, function(data) {
			res.render('index', { title: 'Поиск в Tas-ix', took:data.took, results: data.hits.hits, query: searchTerm });
			console.log(req.query);
			console.log(data);
	  	});
	} else res.render('index', { title: 'Поиск в Tas-ix' });
});

module.exports = router;
