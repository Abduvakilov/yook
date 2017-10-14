module.exports = function(hits, from) {
    for (i = 0; i < hits.length; i++){
    	let title = '';
    	if (hits[i]._source.album) {
    		title = hits[i]._source.album.name + ' - ' + hits[i]._source.album.artist;
    		// delete hits[i]._source.album.name;
    		// delete hits[i]._source.album.artist;
			if (i===0 && from==0){
	    		let description = '<table><tr><td><b>Альбом:</b> </td><td>' +  hits[i]._source.album.name
	    			+ '</td></tr><tr><td><b>Исполнитель:</b> </td><td>' + hits[i]._source.album.artist
	    			+ '</td></tr><tr><td><b>Год выпуска:</b> </td><td>' + hits[i]._source.album.year
	    			+ '</td></tr><tr><td><b>Жанр:</b> </td><td>' + hits[i]._source.album.genre
	    			+ '</td></tr></table><h4>Песни</h4>';
	    		if (hits[i].highlight['album.songs.name']){
	    			description += '<ul>'
	    			for (let high of hits[i].highlight['album.songs.name']){
		    			description += '<li>' + high + '</li>';
	    			}
	    		}
	    		description += '<div class="more">'
	    		for (let song of hits[i]._source.album.songs){
	    			description += '<li>' + song.name + '</li>';
				}
				description += '</div></ul>'
	    		hits[i]._source.description = description;
			} else {
				let description = 'Год выпуска альбома: ' + hits[i]._source.album.year
	    			+ '<br>Жанр: ' + hits[i]._source.album.genre;
	    		if (hits[i].highlight['album.songs.name']){
	    			hits[i].highlight['album.songs.name'].splice(2);
	    			for (let high of hits[i].highlight['album.songs.name']){
		    			description += '<br>' + high;
	    			}
	    		}
	    		hits[i]._source.description = description;
			}

    	} else if (hits[i]._source.artist) {
    		title = hits[i]._source.artist.artist;
    		if (i===0 && from==0){
	    		let description = '<b>Исполнитель:</b> ' + hits[i]._source.artist.artist
	    			+ '<br><b>Жанр:</b> ' + hits[i]._source.artist.genre;
	    		let n = 0;
	    		if (hits[i].highlight){
	    			if (hits[i].highlight['artist.singles.name']) {
		    			description += '<h4>Песни</h4><ul>'
		    			for (let high of hits[i].highlight['artist.singles.name']){
		    				n++;
			    			description += '<li>' + high + '</li>';
		    			}
		    		}
	    		}
	    		for (let song of hits[i]._source.artist.singles){
	    			if (n==1) {
			    		description += '<div class="more">'
					}
	    			description += '<li>' + song.name + '</li>';
	    			n++
				}
				description += '</div>'
	    		hits[i]._source.description = description;
	    	}

    	} else {
    		title = hits[i]._source.title;
    		if (hits[i].highlight !== undefined) {
    			hits[i]._source.description = hits[i].highlight.description;
    		} else if (hits[i]._source.description !== undefined && typeof hits[i]._source.description === 'array'){
    			hits[i]._source.description = hits[i]._source.description.substring(0, 210)
    		}
    	}

    	if (title.length>70){
    		title = title.substring(0, 70);
    		title = title.substring(0, title.lastIndexOf(" ")) + ' ...';
		}



		hits[i]._source.title = title;

    	// console.log(hits[i])

    }
}
