const elasticsearch = require('elasticsearch'),
    //transl = require('../modules/transl'),
    result = require('./result'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    });

module.exports = function(sq, from, callback) {
  //sq = sq + ' ' + transl(sq)
  console.log(sq);
  client.search({
    index: 'targets',
    type: 'targets',
    body: {
      query: {
        function_score: {
          functions: [{
            gauss: {
              publishDate: {scale: '180d'}
            }
          }],
          query: {
            multi_match: {
              query: sq,
              fields: ['title^1.6', 'description', 'category', 'tags', 'artistName^1.2', 'albumName^1.2', 'genre', 'song^1.1', 'single^1.1', 'clip^1.1'],
              fuzziness: 1
            }
          }
        }
      },
      size: 10,
      from: from,
      highlight : {
        require_field_match: false,
        number_of_fragments : 2,
        pre_tags: '<b>',
        post_tags: '</b>',
        fields : {
          description : {
            fragment_size : 80,
          },
          song: {
          },
          single: {
          },
          clip: {
          }
        },
      }
    }
  }, function (error, response) {
          if (error) console.error(error);
          let res=[];
          if (response.hits) {
            res=result(response.hits.hits, from, sq);
            console.log(res);
          };
          callback(error, {res:res,total:response.hits.total,took:response.took});
    })
}