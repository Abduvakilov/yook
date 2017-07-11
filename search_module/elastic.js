const elasticsearch = require('elasticsearch'),
    client = elasticsearch.Client({
      host: '127.0.0.1:9200',
      log: 'error'
    });

var n = 0;

module.exports = {
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
		      // console.error(error);
		      // return;
		    } else callback(response.hits.hits[0] !== undefined)
		})
	},

	nextPage: function(site, callback){
		client.search({
		    index: "crawl", 
		    type: "crawled",
		    body: {
					size : 7,
					query: {
						bool: {
							must: [
								{match: { _id: site }},
								{match: {crawled: true}}
							]
						}
					}
				}
	  	}, function (error, response) {
			if (error) {
		      console.error(error);
		      // return;
		  } else if (response.hits.total !== 0) {
					callback(response.hits.hits[n]._id);
					if (n<7 && n<response.hits.total-2) n++; else n=0;
			} else (console.log('no nextPage'))
		})
	},
	linksToVisit: function(array, callback){
      let i = 0;
      inner();
      function inner(){
         if (array[i]){
           module.exports.create('crawled', array[i], {crawled: false});
           i++;
           inner();
         } else {
           callback();
         }
      }
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


	getDateTime: function() {
	    var date = new Date();

	    var hour = date.getHours();
	    hour = (hour < 10 ? "0" : "") + hour;

	    var min  = date.getMinutes();
	    min = (min < 10 ? "0" : "") + min;

	    var sec  = date.getSeconds();
	    sec = (sec < 10 ? "0" : "") + sec;

	    var year = date.getFullYear();

	    var month = date.getMonth() + 1;
	    month = (month < 10 ? "0" : "") + month;

	    var day  = date.getDate();
	    day = (day < 10 ? "0" : "") + day;

	    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
	}

}

// module.exports.nextPage( function(re){
//     // We've already visited this page, so repeat the crawl
//     if (re !== undefined) console.log(re);
//   }
// )