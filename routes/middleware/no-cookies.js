
module.exports = function(req, res, next){
	if( !req.query.ses || req.query.ses.length < 2 || req.query.ses[0] != 's' || req.headers.cookie )
		return next();

	req.cookies[name] = req.query.ses;
	req.headers.cookie += '; ' + name + '=' + req.query.ses;
	next();
};
