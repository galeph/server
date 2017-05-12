module.exports.item =function (data, req, res, next){
	if(GLOBAL.util.isError(data))
		return next( data );
	var id = GLOBAL.lib.base['64'].decode(req.params.slug);
	if(id.length != 24)
		return next(new Error('No is a item'));

	GLOBAL.db.model('item')
		.findItemAndUser(id, data.user._id)
		.populate('album')
		.count(function (err, num){
			if(err) return next(err);
			next(data);
		});
};

module.exports.album = function (data, req, res, next){
	if(GLOBAL.util.isError(data))
		return next( data );
	GLOBAL.db.model('albums')
		.findBySulgAndUser( req.params['0'], data.user )
		.count(function (err, doc){
			if(err) return next(err);
			if( data.base === 'template' )
				req.page = [ 'album' ];
			if( data.base === 'template' &&  !doc )
				return next( new Error('Not Found albumn') );
			data.album = doc;
			next(data);
	});
};