var req = require('http');
var url = 'http://mytube.uz/uz/tracks/channels/33738.htm';
var u = require('url')
var options = 
{
    // url: url,
    host: u.parse(url).hostname,
    headers: {'user-agent': 'Mozilla/5.0'},
    path: u.parse(url).path
};
req.get(options, function (res) {
  console.log(res.statusCode)
        // if (res.statusCode<299) {
        //   if (res.headers['content-type'].toUpperCase().includes('HTML')) {
        //     sucsessCallback()
        //   } else {
        //     console.log('not HTML on '+url);
        //   module.exports.update("crawled", url, {doc:{crawled: 'not html'}, doc_as_upsert : true}, failCallback());
        //   }
        // } else {
        //   console.log('code>299 on '+url);
        // module.exports.update("crawled", url, {doc:{crawled: 'code>299'}, doc_as_upsert : true}, failCallback());
        // }
    });