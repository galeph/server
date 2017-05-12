module.exports = function (req, res, next){
	if(!req.session.cart || !Array.isArray(req.session.cart))
		req.session.cart = [];

	req.session.falsh = _.compact(req.session.falsh);
	res.locals.moment = require('moment');
	if(req.session.lang)
		res.locals.moment.locale(req.session.lang.code);

	res.locals.classes = [];
	res.locals.css = [];
	req.page = [];

	if ( !_.isEmpty( req.user ) ){
		res.locals.classes.push('lgn');
		res.locals.me = req.user;
		res.locals.login = true;
	} else {
		res.locals.me = req.user;
	}

	res.locals.sessionID = lib.base['32'].encode( req.sessionID );
	res.locals.session = req.session;
	res.locals.now = req.query.now = _.isEmpty(req.query.now) ? new Date() : new Date( req.query.now );
	res.locals.originalUrl = 'https://' + req.headers.host + req.originalUrl;
	req.query.pag = _.isEmpty( req.query.pag ) ? 0 : parseFloat( req.query.pag );

	next();
};
