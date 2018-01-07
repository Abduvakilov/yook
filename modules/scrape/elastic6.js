let elasticsearch = require('elasticsearch'),
    client = elasticsearch.Client({
      host: 'localhost:9200',
      log: 'error'
    }),
    u = require('url'),
    http = require('http'),
    https = require('https'),
    date = require('../date');

module.exports = {
	date: date,
	nextPages: [],
	update: function(index, id, body, callback){
		client.update({
		    index: index, 
		    type: index, 
		    id: id, 
		    body: body 
	  	}, function(error, response) {
		    if (error) {
		      console.error(error);
		      // return;
		    }
	    	if (callback) {
		 		callback();
			};		    
	  })
	},

	create: function(id, body, callback){
		client.get({
			index: 'crawled',
			type: 'crawled',
			id: id
		}, function (error, response) {
			if (!error) {
				if (callback) {	
					callback();
				}
			} else {
				client.create({
					index: 'crawled', 
					type: 'crawled', 
					id: id, 
					body: body 
				}, function(error, response) {
					if (error) {
					console.error(error);
					// return;
					}
					else {
						if (callback) {
							setTimeout(callback,1000);
						}
					}
				})
			}
		})
	},

	exists: function(id, callback){
		client.get({
			index: 'crawled',
			type: 'crawled',
			id: id
		}, function (error, response) {
		    if (error) {
		      console.error(error);
		      // return;
		    } else callback(response.found && response._source.crawledDate)
		})
	},

	nextPage: function(site, callback){
		if (module.exports.nextPages.length != 0) {
			// console.log('There is an array of pages waiting '+module.exports.nextPages.length)
			callback(module.exports.nextPages.splice(0, 1)[0]._id);
		} else {
			client.search({
			    index: "crawled", 
			    type: "crawled",
			    body: {
						size : 100,
						query: {
							constant_score: {
								filter: {term: {crawled: site}}
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
	linksToVisit: function(array, short_address, reindex, callback){ //to-do: reindex
		let i = 0,
			bulk = [];
		array.length > 0 ? inner() : callback();
		
		function inner(){
			if (array[i]){
				array[i] = decodeURI(array[i]);
		 		if (array[i].length<250) {
			 		bulk.push({create:{_id: array[i]}}); //use index for update
					bulk.push({crawled: short_address});
			 	};
				i++;
				inner();
			} else {
				client.bulk({index:'crawled',type:'crawled',body:bulk}, function(err,resp){
					err ? console.error(err) : callback()
				})
			}
		};
    },

	checkUrl: function(url, failCallback, sucsessCallback, anyStatus){
		if (url.startsWith('https')) {req = https} else {req = http};
		let options = {
		    host: u.parse(url).hostname,
		    headers: {'user-agent': 'yook'},
		    path: encodeURI(u.parse(url).path)
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
};