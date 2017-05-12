const request = require('request');

/**
 * Contrutor de ReCaptha
 * @param  {String} name Que se esta probando
 * @return {Function}    Ejecutor en las llamadas
 */
module.exports = function (name, max) {
	return function (req, res, next) {
		if(!req.session[ 'show' + name ] )
			req.session[ 'show' + name ] = 0;

		req.session[ 'show' + name ]++;

		if( req.session[ 'show' + name ] < max )
			return next();

		var ret = req.headers.referer || ( req.vhost + req.originalUrl );
		request.post('https://www.google.com/recaptcha/api/verify',{
			qs : {
				privatekey : GLOBAL.CONFIG.key.recaptcha.secret,
				challenge: req.body.recaptcha_challenge_field,
				response:  req.body.recaptcha_response_field,
				remoteip : req.ip
			}
		}, function (err, rez, body) {
			if(err) return next(err);
			var body = body.split('\n');
			if(!_.toBoolean(body[0]) )
				return res.redirect(ret);
			next();
		});
	};
};
