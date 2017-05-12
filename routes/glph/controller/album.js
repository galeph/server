module.exports = function (data, req, res, next){
	req.page = [ 'album' ];
	GLOBAL.async.parallel({
		view :function (callback) {
			GLOBAL.db.model('albums')
				.findBySulgAndUser( req.params.slug, data.user )
				.count(callback);
		},
		item : function (callback) {
			GLOBAL.db.model('item')
				.findItemAndUser(id, data.user._id)
				.populate('album')
				.exec(callback);
		},
		// download : function (callback) {
		// 	GLOBAL.db.model('???
		// }
	},  function (err, num){
		if(err) return next(err);
		if( data.base === 'template' &&  _.isEmpty(num.item) )
			return next( new Error('Not Found item') );
		_.extend(data, num);
		next(data);
	});
};

module.exports.socket = function (data) {
	var socket = this;
	GLOBAL.async.parallel({
		user : function (callback) {
			GLOBAL.db.model('user').findFollowing( data.user ).exec( callback );
		},
		album : function (callback) {
			GLOBAL.db.model('albums').findBySulg( data.sulg ).exec( callback );
		}
	}, function (err, result){
		if (err || _.isEmpty( result.album ) || _.isEmpty( result.user ) )
			return socket.emit('error', { error : err } );
		if ( result.album.user.toString() != result.user._id.toString() )
			return socket.emit('error', { error : err } );
		GLOBAL.db.model('item').findByAlbums( result.album._id, result.user._id).exec(function (err, items){
			if(err || _.isEmpty(items))
				return socket.emit('error', { error : err } );
			result.items = items;
			result.who = 'info';
			result.title = result.album.name ;
			delete result.user;
			socket.emit('view', result);
		});
	});
	// },
	// list : function(data){
	// 	var socket = this;
	// 	db.albums.findByUser( lib.base['64'].decode( data.nit ) )
	// 		.skip( data.page * nxPage )
	// 		.limit( nxPage )
	// 		.exec( function (err, items){
	// 			if(err)
	// 				return socket.emit('error', err );
	// 			socket.emit('view', docs);
	// 		});
	// }
};
