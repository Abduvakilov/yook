let moment = require('moment'),
	// scores = {
	// 	kinopoisk: 'Кинопоиск',
	// 	imbd: 'IMDb',
	// 	rating: 'Player'
	// },
	topdict = {
		country: 'Страна',
		director: 'Режиссер',
		actor: 'Актеры',
		budget: 'Бюджет',
		forAge: 'Возрастные ограничение',
		album: 'Альбом',
		artist: 'Исполнитель',
	},
	// objarr = {
	// 	'songs.name':'Песни',

	// },
	subtitles = [
		'subtitle', 'date', 'genre'
	];
const topLength=230, topArr=6, regArr=3;
module.exports = function(hits, from, query) {
	let res = [];
    for (let i = 0; i < hits.length; i++){
		let obj=hits[i]._source,
			subtitle='',
			h=hits[i].highlight||{},
			isArtist=(obj.single!=null || obj.clip!=null),
	    	scorePerWord=hits[0]._score/(query.trim().split(/\s+/).length/2)
    		top = (i===0 && from===0 && scorePerWord>9.9),
    		arrLength = top ? topArr : regArr,
    		title = obj.title ||  (obj.albumName + ' - ' + obj.artistName) || '',
    		obj.date=obj.year||(obj.publishDate?moment(obj.publishDate, 'DD.MM.YY').locale('ru').format('DD MMM YY [г.]'):''),
    		description=(h.description?h.description.join('... '):'')||
    			(obj.description?(obj.description.substring(0, 160) + ' ...'):''),
    		hTopList=h.song||(h.single&&h.clip?(h.single.length>=h.clip.length?h.single:h.clip):(h.single||h.clip))||[],
    		topList=obj.song||(obj.single&&obj.clip?(obj.single.length>=obj.clip.length?obj.single:obj.clip):(obj.single||obj.clip))||[];
		//
		
    	let subarr=[];
    	for (st of subtitles) {
    		if (obj[st]) {
	    		subarr.push(obj[st]);
	    		obj[st]='';
    		}
    	};
    	subtitle = subarr.join(' ‧ ')
    	if (hTopList.length>arrLength) hTopList.splice(0, arrLength)
    	else hTopList=hTopList.concat(topList.filter(x=>!hTopList.map(y=>y.replace(/\<b\>/g,'').replace(/\<\/b\>/g,'')).includes(x)).splice(0,arrLength-hTopList.length));
    	let songs = hTopList.join(' ‧ ');

		res.push({});
		if (top){
			let tsub=(obj.year ? (obj.year+' г. ‧ ') : '')+(obj.genre||''),
				tdesc=(obj.description ? 
				(obj.description.length>topLength+10 ?
					('<input type="checkbox" id="post"/><p>'+obj.description.slice(0,topLength)+' <span class="more">'+obj.description.slice(topLength)+'</span></p><label for="post">Ещё↓</label><br>')
				:''+'<br>')
			:'');
			for (let key in topdict){
				tdesc+=obj[key] ? ('<br><b>' + topdict[key] + ': </b>' + obj[key]) : '';
		    };
		    res[i].ttitle=obj.albumName||title;
	    	res[i].tsub=isArtist?'Певец(ца)':(obj.song?('Музыкальный Альбом - '+obj.artistName):'')||tsub;
	    	res[i].tdesc=tdesc;
	    	res[i].tlist=topList?topList.slice(0,topArr):[];   //something wrong
	    	res[i].tmoreList=topList.length>topArr?topList.slice(topArr):[];
		};
		if (title.length>60){
    		title = title.substring(0, 55);
    		title = title.substring(0, title.lastIndexOf(" ")) + ' ...';
		}
		if (hits[i]._id.length>70){
    		hits[i]._id = hits[i]._id.substring(0, 70);
		};
	    res[i].title=title;
	    res[i].subtitle=subtitle;
	    res[i].img=obj.img;
	    res[i].description=description;
	    // res[i].date=date;
	    res[i].songs=songs;
	    res[i].genre=obj.genre;
	    res[i].link=hits[i]._id;
	    res[i].scores = {
	    	kinopoisk: [hits[i]._source.kinopoisk, 'КиноПоиск'],
	    	imbd: [hits[i]._source.imbd, 'IMDb'],
	    	rating: [hits[i]._source.rating, 'Player.uz']
	    }
	    res[i].score=hits[i]._score
	    res[i].isArtist=isArtist;
    };
    return res;
};