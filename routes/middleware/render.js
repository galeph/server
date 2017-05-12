function simple (data, req, res, next) {
	if(util.isError(data) || data.path || data.message)
		return next( data );

	if( _.isEmpty( res.locals.agent ) || !res.locals.agent.support )
		res.locals.css.push( 'no-sopport');

	if(!Array.isArray(req.page) )
		return next( new Error('Invalid') );
	
	res.render( req.page.join('/'), data );
}

function notFound (req, res, next) {
	var errs = new Error('Dont Found');
	errs.status = 404;
	errs.url = req.hostname + req.originalUrl;

	GLOBAL.db.model('links').findByRegExp( errs.url, function (err, doc) {
		if(err || !doc || !doc.starts )
			return next(err || errs );

		res
			.status(302)
			.redirect( errs.url.replace( doc.regex, doc.original) );
	});
}

function rends (es, req, res, next) {
	if(util.isError(es) || es.message)
		console.error( es || es.message ); // TODO Pag Error

	if( res.locals && !_.isEmpty( res.locals.agent ) ? !res.locals.agent :  false )
		res.locals.classes.push( 'nosopport') ;

	res
		.status(es.status || 503 )
		.render(path.join.apply(this, [ __dirname, '..', 'api', 'views', 'error-index' ] ), {
		error : es,
		title : /*t('['] ||*/ 'Error',
		page : true
	});
}

/**
 * Contructor basico de metodos
 * @param  {Object} app Instacina de Expressjs
 * @return {Object}     Instacina de Expressjs
 */
module.exports = function(app){
	app.set('view engine', 'jade');

	app.use(simple);
	app.use(notFound);
	app.use(rends);

	return app;
};
