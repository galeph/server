
module.exports.get = function (doc, req, res, next){
	res.locals.css.push('login');
	req.page.push('change');
	res.locals.classes.push( 'passw' );
	res.locals.classes.push( 'auth' );
	next({
		data : doc.toJSON(),
		link : _.strRight(doc.recover, '/' )
	});
};

module.exports.post = function (doc, req, res, next){
	doc.setPassword(req.body.repass);
	doc.save(function (err){
		if (err || _.isEmpty(doc) )
			return next(err || new Error('Not exist the User') );
		res.redirect( GLOBAL.CONFIG.servers.www.url );
	});
};
