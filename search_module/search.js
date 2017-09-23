const elasticsearch = require('elasticsearch'),
    transl = require('./transl'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    });

module.exports = function(searchTerm, from, callback) {
  searchTerm = searchTerm + ' ' + transl(searchTerm)
  console.log(searchTerm)
  client.search({
    index: 'crawl',
    type: 'targets',
    body: {
      query: {
        multi_match: {
          query: searchTerm,
          fields: ['title^3', 'description']
        }
      },
      size: 10,
      from: from,
      highlight : {
        fields : {
          description : {}
        },
        pre_tags: '<b>',
        post_tags: '</b>'
      }
    }
  }, function (err, resp) {
      if(err){
        console.error(err);
      } else {
        callback(resp);
      }
  });
};