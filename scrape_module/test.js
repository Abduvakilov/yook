const elastic = require('./elastic')
var url = "http://megasoft.uz/get/2466?1499015934"
var obj = {pageLinks: ["http://megasoft.uz/get/2466?1499015934", "http://megasoft.uz/get/2467?1499015934"]}
elastic.linksToVisit(obj.pageLinks, function(){
      elastic.update("crawled", url, {doc: {crawled: true}, doc_as_upsert : true} )
    })