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
          multi_match: {
            query: sq,
            params: {
              now: new Date()
            },
            filters:{
              filter: {
                exists: {
                  field: 'publishDate'
                }
              },
              script: '(0.08 / ((3.16*pow(10,-11)) * abs(now - doc["publishDate"].date.getMillis()) + 0.05)) + 1.0'
            },
            fields: ['title^4', 'description', 'category', '*.tags^2', '*.artist^3', '*.name', '*.genre'],
            fuzziness: 1
          },
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
          result(response.hits.hits, from)
          callback(error, response);
    })
}