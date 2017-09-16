var elasticsearch = require('elasticsearch');

var client = elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'error'
  });

module.exports.search = function(searchData, callback) {
  client.search({
    index: 'epubs',
    body: {
      query: {
        bool: {
          must: {
            match: {
              "title": searchData.searchTerm
            }
          }
        }
      }
    }
  }).then(function (resp) {
    callback(resp.hits.hits);
  }, function (err) {
      callback(err.message);
      console.log(err.message);
  });
};
