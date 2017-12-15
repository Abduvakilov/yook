let moment = require('moment'),
	scores = {
		kinopoisk: 'Кинопоиск',
		imbd: 'IMDb',
		rating: 'Player'
	},
	topdict = {
		country: 'Страна',
		director: 'Режиссер',
		actor: 'Актеры',
		budget: 'Бюджет',
		forAge: 'Возрастные ограничение',
		album: 'Альбом',
		artist: 'Исполнитель',
	},
	objarr = {
		'songs.name':'Песни',

	},
	subtitle = [
		'subtitle', 'year', 'genre'
	];
const topLength=230, arrLength=2;
module.exports = function(hits, from) {
    for (let i = 0; i < hits.length; i++){
		let obj=hits[i]._source,
			h=hits[i].highlight||{},
    		title = obj.title ||  (obj.albumName + ' - ' + obj.artistName) || '',
    		date=moment(obj.publishDate, 'DD.MM.YY').locale('ru').format('DD MMM YY [г.]'),
    		description = h.description || (h['songs.name']?h['songs.name'].splice(arrLength).join(' ‧ '):obj.description);
    	// description+=
    	if (hits[i]._source.album) {


			if (i===0 && from==0){
	    		let description = '<h4>Песни</h4>';
	    		if (hits[i].highlight['songs.name']){
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
	    			hits[i].highlight['album.songs.name'].splice(arrLength);
	    			for (let high of hits[i].highlight['album.songs.name']){
		    			description += '<br>' + high;
	    			}
	    		}
	    		hits[i]._source.description = description;
			}

    	} else if (hits[i]._source.artist) {
    		let more = false;
    		let description = ''
    		if (i===0 && from==0){
    			limit = 5;
    			description += '<b>Исполнитель:</b> ' + hits[i]._source.artistName + '<br>'
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
			let description=(hits[i]._source.subtitle ? hits[i]._source.subtitle : '');
    		if (i===0 && from===0){
    			let tsub=(hits[i]._source.year ? (hits[i]._source.year+' г. ‧ ') : '')+(hits[i]._source.genre||'');
    			let tdesc=(hits[i]._source.description ? 
					(hits[i]._source.description.length>topLength+10 ?
						('<input type="checkbox" id="post-1"/><p>'+hits[i]._source.description.slice(0,topLength)+' <span class="more">'+hits[i]._source.description.slice(topLength)+'</span></p><label for="post-1">Ещё↓</label><br>')
					:hits[i]._source.description+'<br>')
				:'');
				for (let key in topdict){
					tdesc+=hits[i]._source[key] ? ('<br><b>' + topdict[key] + ': </b>' + hits[i]._source[key]) : '';
			    }
		    	hits[i].tsub=tsub;
		    	hits[i].tdesc=tdesc;
			};

    		if (hits[i].highlight) {
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

    	if (title.length>60){
    		title = title.substring(0, 55);
    		title = title.substring(0, title.lastIndexOf(" ")) + ' ...';
		}
		if (hits[i]._id.length>70){
    		hits[i]._id = hits[i]._id.substring(0, 70);
		}
		// .pre Date before desc
		if (hits[i]._source.description && hits[i]._source.publishDate) {
			hits[i]._source.description = '<span>' + moment(hits[i]._source.publishDate, 'DD.MM.YY').locale('ru').format('DD MMM YY [г.]') + ' - </span> ' + hits[i]._source.description;
		} else if(hits[i]._source.publishDate) {
			hits[i]._source.description = '<span>' + moment(hits[i]._source.publishDate, 'DD.MM.YY').locale('ru').format('DD MMM YY [г.]') + '</span> ';
		}


		hits[i]._source.title = title;


    }


}
