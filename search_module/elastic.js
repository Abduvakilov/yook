const elasticsearch = require('elasticsearch'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    }),
    u = require('url'),
    http = require('http'),
    https = require('https'),
    date = require('../modules/date')


module.exports = {
	date: date,
	nextPages: [],
	update: function(type, id, body, callback){
		client.update({
		    index: "crawl", 
		    type: type, 
		    id: id, 
		    body: body 
	  }, function(error, response) {
		    if (error) {
		      // console.error(error);
		      // return;
		    }
		    else {
		    // console.log(response);
		    }
		    if (callback) {
			    callback();
			}
	  })
	},

	create: function(type, id, body){
		client.create({
		    index: "crawl", 
		    type: type, 
		    id: id, 
		    body: body 
	  }, function(error, response) {
		    if (error) {
		      // console.log(error);
		      // return;
		    }
		    else {
		    // console.log(response);
		    }
	  })
	},

	exists: function(id, callback){
		client.search({
			index: 'crawl',
			type: 'crawled',
			body: {
				size : 1,
				query: {
					bool: {
						must: [
							{match: { _id: id }},
							{match: {crawled: true}}
						]
					}
				}
		  }
		}, function (error, response) {
		    if (error) {
		      console.error(error);
		      // return;
		    } else callback(response.hits.hits[0] !== undefined)
		})
	},

	nextPage: function(site, callback){
		if (module.exports.nextPages.length != 0) {
			// console.log()
			callback(module.exports.nextPages.splice(0, 1)[0]._id);
		} else {
			client.search({
			    index: "crawl", 
			    type: "crawled",
			    body: {
						size : 100,
						query: {
							bool: {
								must: {match: {crawled: site}}
							}
						}
					}
		  	}, function (error, response) {
				if (error) {
			      console.error(error);
			      // return;
			  	} else if (response.hits.total !== 0) {
					module.exports.nextPages = response.hits.hits;
					callback(module.exports.nextPages.splice(0, 1)[0]._id);
				} else (console.log('no nextPage'));
			})
		}
	},
	linksToVisit: function(array, short_address, callback, reindex){
      let i = 0;
      inner();
      function inner(){
         if (array[i]){
         	if (reindex) {
         		module.exports.update('crawled', array[i], {doc:{crawled: short_address}, doc_as_upsert : true});
         	} else module.exports.create('crawled', array[i], {crawled: short_address});
        	i++;
        	inner();
         } else {
           callback();
         }
      }
    },

	checkUrl: function(url, failCallback, sucsessCallback, anyStatus){
		if (url.startsWith('https')) {req = https} else {req = http};
		let options = {
		    host: u.parse(url).hostname,
		    headers: {'user-agent': 'Mozilla/5.0'},
		    path: u.parse(url).path
		};
		req.get(options, function (res) {
			// console.log('status code: '+res.statusCode)
  			if (res.statusCode<299) {
  				if (res.headers['content-type'].toUpperCase().includes('HTML')) {
  					sucsessCallback()
  				} else {
  					console.log('not HTML on '+url);
					module.exports.update("crawled", url, {doc:{crawled: 'not html'}, doc_as_upsert : true}, failCallback());
  				}
  			} else if (anyStatus) {sucsessCallback()
  			} else {
  				console.log('code>299 on '+url);
				module.exports.update("crawled", url, {doc:{crawled: 'code>299'}, doc_as_upsert : true}, failCallback());
  			}
		});
	},

	// notCrawled: function(url){
	// 	client.update({
	// 	    index: "crawl", 
	// 	    type: "crawled",
	// 	    id: url,
	// 	    body: {doc:{crawled:false}}
	//   	}, function (error, response) {
	// 	  if (error) {
	// 	      console.error(error);
	// 	      // return;
	// 	    }
	// 	    else {
	// 	    	// console.log(response.hits.hits[0]._id);
	// 	    }
	// 	})
	// },


	// getDateTime: function() {
	//     var date = new Date();

	//     var hour = date.getHours();
	//     hour = (hour < 10 ? "0" : "") + hour;

	//     var min  = date.getMinutes();
	//     min = (min < 10 ? "0" : "") + min;

	//     var sec  = date.getSeconds();
	//     sec = (sec < 10 ? "0" : "") + sec;

	//     var year = date.getFullYear();

	//     var month = date.getMonth() + 1;
	//     month = (month < 10 ? "0" : "") + month;

	//     var day  = date.getDate();
	//     day = (day < 10 ? "0" : "") + day;

	//     return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
	// }
};

// module.exports.nextPage( function(re){
//     // We've already visited this page, so repeat the crawl
//     if (re !== undefined) console.log(re);
//   }
// )