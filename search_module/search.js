const elasticsearch = require('elasticsearch'),
    //transl = require('../modules/transl'),
    result = require('../modules/result'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    });

module.exports = function(sq, from, callback) {
  //sq = sq + ' ' + transl(sq)
  console.log(sq);
  client.search({
    index: 'crawl',
    type: 'targets',
    body: {
      query: {
        function_score: {
          functions: [{
            gauss: {
              crawledDate: {scale: '40d'}
            }
          }],
          query: {
            multi_match: {
              query: sq,
              fields: ['title^4', 'description', 'category', '*.tags^2', '*.artist^3', '*.name', '*.genre'],
              fuzziness: 1
            }
          }
        }
      },
      size: 10,
      from: from,
      highlight : {
        fields : {
          description : {fragment_size : 80, number_of_fragments : 2},
          "*.name": {},
          "*.genre": {}
        },
        pre_tags: '<b>',
        post_tags: '</b>'
      }
    }
  }, function (error, response) {
          if (error) console.error(error);
          console.log(response.hits)
          if (response.hits) {
            result(response.hits.hits, from);
          }
          callback(error, response);
    })
}