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
    moment = require('moment');
let superagent = charset(request),
    Xray = require('x-ray');
module.exports = x;
function x(enc, phant) {
  return Xray({
    filters: {
      whiteSpace: function (value) {
        return typeof value === 'string' ? value.replace(/(?:\r\n|\r|\n|\t)/g, ' ').replace(/ +/g, ' ').trim() : value
      },
      decode: function (value) {
        return typeof value === 'string' ? entities.decodeHTML(value) : value
      },
      remove: function (value, toRemove) {
        return typeof value === 'string' ? value.replace(toRemove, '') : value
      },
      toArray: function (value) {
        return typeof value === 'string' ? value.split(',. ') : value
      },
      toArray2: function (value) {
        return typeof value === 'string' ? value.split(', ') : value
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
      date: function (value) {
        return typeof value === 'string' ? moment(value, 'DD MMMM YYYY', 'ru').format('DD.MM.YY') : value
      },
      //alltor
      replaceLineBreak: function (value) { 
        return typeof value === 'string' ? value.replace(/\<br\>/g, '‧').replace(/\<\/p\>/g, '‧') : value
      },
      deleteDownload: function (value) {
        return typeof value === 'string' ? value.replace('Скачать Скачать бесплатно и на максимальной скорости! Как скачивать? · Что такое торрент? · Рейтинг и ограничения', '') : value          
      },
      removeTags: function (value) {
        return typeof value === 'string' ? value.replace(/<(?:.|\n)*?>/gm, '') : value          
      },
      //megasoft
      removeDown: function (value) {
        return typeof value === 'string' ? value.replace('Скачать этот файл', '') : value
      },
      //origin mediabay
      removeComma: function (value) {
        return typeof value === 'string' ? value.replace(',', '') : value
      },
      removeTtt: function(value) {
         return typeof value === 'string' ? value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<(?:.|\n)*?>/gm, '') : value
      },
      removeTtt2: function(value) {
         return typeof value === 'string' ? value.replace('&#xA0; Your browser does not support HTML5 video. Big Buck Bunny 00:00 -- / -- ','') : value
      }
    }
  }).driver(enc ? driver(enc, options) : phantom(phantomOptions))
}
function driver(enc, opts) {
  var agent = superagent.agent(opts || {})

  return function http_driver(ctx, fn) {
    agent
      .get(ctx.url)
      .charset(enc)
      .set(ctx.headers)
      // .timeout(5000)
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