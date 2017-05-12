module.exports = function ( req, res, next ) {
	res.locals.css.push('login');
	req.page.push( 'recover' );
	res.locals.classes.push( 'recover' );
	res.locals.classes.push( 'auth' );
	next({ page : 'revocer' });
};

module.exports.beforePost = function ( data, req, res, next ) {
	GLOBAL.db.model('user')
		.findByUser( req.body.user )
		.exec('findOne', function (err, user){
		if(err || _.isEmpty( user ) )
			return next(err ||  new Error('Not exist the recover') );
		next(user);
	});
};

module.exports.post = function( data, req, res, next ) {
	if(util.isError(data))
		return next(data);

	res.mail('recover',  {
		me : data
	}, function (err, doc){
		if( err ) return next(err);
		req.flash('basic', 'check email' );
		res.redirect(GLOBAL.CONFIG.servers.www.url);
	});
};
