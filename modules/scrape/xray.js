const charset = require('superagent-charset'),
    request = require('superagent'),
    entities = require('entities'),
    phantom = require('x-ray-phantom'),
    phantomOptions = {
      webSecurity: false,
      timeout: 1000,
      resourceTimeout: 1000,
      loadImages: false,
    },
    options = {           //Enable cookies
      headers: {              //Set headers
        "User-Agent": "yook",
        Connection: "close"
      }
    },
    u = require('url'),
    Xray = require('x-ray');
var superagent = charset(request);
module.exports = x;
function x(enc, phant) {
  return Xray({
      filters: {
        whiteSpace: function (value) {
          return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').replace(/'/g, "''").trim() : value
        },
        decode: function (value) {
          return typeof value === 'string' ? entities.decodeHTML(value) : value
        },
        toArray: function (value) {
          return typeof value === 'string' ? value.split(',. ') : value
        },
        removeSpoiler: function (value) {
          return typeof value === 'string' ? value.replace('свернуть развернуть', '') : value
        },
        afterATag: function (value){
          return typeof value === 'string' ? value.split('</a>')[1] : value
        },
        afterColon: function (value){
          return typeof value === 'string' ? value.split(':')[1] : value
        },
        parseInt: function (value){
          return typeof value === 'string' ? parseInt(value) : value
        },
        parseFloat: function (value){
          return typeof value === 'string' ? parseFloat(value) : value
        },
        // date: function (value) {
        //   return typeof value === 'string' ? elastic.moment(value, 'DD MMMM YYYY', 'ru').toISOString() : value
        // }
      }
    }).driver(phant ? phantom(phantomOptions) : driver(enc, options))
}
function driver(enc, opts) {
  var agent = superagent.agent(opts || {})

  return function http_driver(ctx, fn) {
    agent
      .get(ctx.url)
      .charset(enc)
      .set(ctx.headers)
      .timeout(5000)
      .end(function(err, res) {
        if (err && !err.status) return fn(err)

        ctx.status = res.status
        ctx.set(res.headers)

        ctx.body = 'application/json' == ctx.type
          ? res.body
          : res.text

        // update the URL if there were redirects
        ctx.url = res.redirects.length
          ? res.redirects.pop()
          : ctx.url

        return fn(null, ctx)
      })
  }
}