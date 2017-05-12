/**
 * Contructor de pagina principañ
 * @param  {object}   req  Peticion del cliente
 * @param  {object}   res  Respuesta del cliente
 * @param  {Function} next Funcion para seguir
 */
module.exports = function(req, res, next){
	req.page.push(req.user ? 'home' :'landing');
	res.locals.css.push( req.user ? 'home' :'landing');
	res.type('html');
	next({
		is : req.user ? 'home' :'landing',
		title : res.locals.gettext('galeph'),
		name : req.user ? 'www' : 'lang',
		isType : 'item'
	});
};

/**
 * Contructor de configuracion de emails
 * @param  {object}   req  Peticion del cliente
 * @param  {object}   res  Respuesta del cliente
 * @param  {Function} next Funcion para seguir
 */
module.exports.account = function (req, res, next){
	req.params.template = 'settings-account';
	res.locals.emails = req.user.connect.emails;
	next();
};

/**
 * Contructor de configuracion de externas
 * @param  {object}   req  Peticion del cliente
 * @param  {object}   res  Respuesta del cliente
 * @param  {Function} next Funcion para seguir
 */
module.exports.extend = function (req, res, next){
	GLOBAL.async.map(GLOBAL.CONFIG.key.external, function (num, call) {
		res.locals.me.populate('connect.social.' + num, call );
	}, function (err) {
		if(err) return next(err);
		req.params.template = 'settings-extend';
		next();
	});
};
