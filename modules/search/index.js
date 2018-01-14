const elasticsearch = require('elasticsearch'),
    // transl = require('../transl'),
    result = require('./result'),
    client = elasticsearch.Client({
      host: process.env.es || 'localhost:9200',
      log: 'error'
    });

module.exports = function(sq, from, callback) {
  let wordcount = sq.trim().split(/\s+/).length;
  // sq = sq + ' ' + transl(sq)
  console.log(sq);
  client.search({
    index: 'targets',
    type: 'targets',
    body: {
      query: {
        function_score: {
          functions: [{
            gauss: {
              publishDate: {scale: '180d', decay: 0.95}
            },
          },
          {
            filter: {
              exists: {
                field: 'publishDate'
              }
            },
            weight:1.6
          }],
          query: {
            bool: {
              should: [{
                multi_match: {
                  query: sq,
                  fields: ['title^1.7', 'category', 'tags', 'artistName^1.7', 'albumName^1.7', 'genre', 'song^1.2', 'single^1.2', 'clip^1.2', 'music^1.2', 'country', 'director', 'actor', 'subTitle', 'site'],
                  fuzziness: 'AUTO',
                  boost: 0.7
                }},
                {
                multi_match: {
                  query: sq,
                  fields: ['title^1.7', 'description', 'category', 'tags', 'artistName^1.7', 'albumName^1.7', 'genre', 'song^1.2', 'single^1.2', 'clip^1.2', 'music^1.2', 'country', 'director', 'actor', 'subTitle', 'site'],
                }
              }
              ]
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
            res=result(response.hits.hits, from, wordcount);
            console.log(res);
          };
          callback(error, {res:res,total:response.hits.total,took:response.took});
    })
}