var express = require('express');
var router = express.Router();

var searchModule = require('../search_module/search');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Поиск в Tas-ix' });
});

router.get('/search', function(req, res) {
  searchModule.search(req.query, function(data) {
    res.render('index', { title: 'Поиск в Tas-ix', results: data, query: req.query.searchTerm });
    console.log(req.body);
    console.log(data);
  });
});

module.exports = router;
