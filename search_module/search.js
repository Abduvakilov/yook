const elasticsearch = require('elasticsearch'),
    //transl = require('../modules/transl'),
    result = require('../modules/result'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    });

module.exports = function(searchTerm, from, callback) {
  //searchTerm = searchTerm + ' ' + transl(searchTerm)
  console.log(searchTerm)
  client.search({
    index: 'crawl',
    type: 'targets',
    body: {
      query: {
        multi_match: {
          query: searchTerm,
          fields: ['title^4', 'description', 'category', '*.tags^2', '*.artist^3', '*.name', '*.genre'],
          fuzziness: 1
        }
      },
      size: 10,
      from: from,
      highlight : {
        fields : {
          description : {},
          "*.name": {},
          "*.genre": {}
        },
        pre_tags: '<b>',
        post_tags: '</b>'
      }
    }
  }, function (error, response) {
          if (error) console.error(error);
          console.log(response.hits.hits)
          result(response.hits.hits, from)
          callback(error, response);
    })
}