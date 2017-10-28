const moment = require('moment');
module.exports = function(hits, from) {
    for (let i = 0; i < hits.length; i++){
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
    		let more = false;
    		let description = ''
    		if (i===0 && from==0){
    			limit = 5;
    			description += '<b>Исполнитель:</b> ' + hits[i]._source.artist.artist + '<br>'
    		} else {
    			limit = 2;
    		}

    		description += '<b>Жанр:</b> ' + hits[i]._source.artist.genre
	    		+ '<h4>Песни</h4><ul>';
    		let n = 0;
    		if (hits[i].highlight){
    			if (hits[i].highlight['artist.singles.name']) {
	    			for (let high of hits[i].highlight['artist.singles.name']){
		    			description += '<li>' + high + '</li>';
	    				n++;
	    			}
	    		}
    		}
    		for (let song of hits[i]._source.artist.singles){
    			if (!more && n>limit) {
		    		description += '<div class="more">';
		    		more = true;
				}
    			description += '<li>' + song.name + '</li>';
    			n++;
			}
			for (let clip of hits[i]._source.artist.clips){
    			if (!more && n>1) {
		    		description += '<div class="more">';
		    		more = true;
				}
    			description += '<li>' + clip.name + '</li>';
    			n++;
			}
			if (more) {
	    		description += '</div>';
			}
			description += '</ul>';
    		hits[i]._source.description = description;

    	} else {
    		title = hits[i]._source.title;
    		if (hits[i].highlight !== undefined) {
				if (hits[i].highlight.description){
	    			hits[i]._source.description = '';
	    			for (let i2 = 0; i2 < hits[i].highlight.description.length; i2++) {
	    				hits[i]._source.description += hits[i].highlight.description[i2] + ' ... '
	    			}
	    		}
    		} else if (hits[i]._source.description !== undefined && typeof hits[i]._source.description === 'string'){
    			hits[i]._source.description = hits[i]._source.description.substring(0, 160) + ' ...';
    		}

    	}

    	if (title.length>70){
    		title = title.substring(0, 70);
    		title = title.substring(0, title.lastIndexOf(" ")) + ' ...';
		}
		// .pre Date before desc
		if (hits[i]._source.description && hits[i]._source.publishDate) {
			hits[i]._source.description = '<span>' + moment(hits[i]._source.publishDate).locale('ru').format('DD MMM YY [г.]') + ' - </span> ' + hits[i]._source.description;
		} else if(hits[i]._source.publishDate) {
			hits[i]._source.description = '<span>' + moment(hits[i]._source.publishDate).locale('ru').format('DD MMM YY [г.]') + ' - </span> ';
		}


		hits[i]._source.title = title;


    }


}
