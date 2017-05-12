//Perfiles
module.exports = function (req, res, next){
	GLOBAL.db.model('user').findByUser( req.params.apodo ).exec('findOne', function (err, user){
		if( err || _.isEmpty(user) )
			return next( err || new Error( 'Invalid' ) );
		async.parallel({
			items : function (callback){
				GLOBAL.db.model('item')
					.findByUser( user )
					.populate('creator')
					.limit( req.query.limit )
					.skip( req.query.page * req.query.limit )
					.sort('-dateCr')
					.exec( callback );
			},
		}, function (err, result){
			if( err )
				return next( err || new Error( 'Invalid' ) );
			result.user = user;
			result.url = GLOBAL.CONFIG.servers.api.url.replace('api', user.profile.nick);
			next(result);
		});
	});
};
