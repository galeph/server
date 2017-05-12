/**
 * Obteniendo compras
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports.in = function (req, res, next){
	var data = { seller : true };
	req.page = [ 'in' ];
	GLOBAL.db.model('checkin')
		.findByIdAndUser(req.params.id, req.user)
		.exec(function (err, doc) {
		if(err || _.isEmpty(doc))
			return next(err || new Error('No exist'));
		res.locals.css.push( 'ng-checking' );
		req.page.push('details');
		data.checkin = doc;
		data.seller = true;
		data.type = 'shop';
		data.name = 'shop';
		data.base = 'template';
		next(data);
	});
};

/**
 * Obteniendo salidas
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports.out = function (req, res, next) {
	var data = {};
	req.page = [ 'out' ];
	GLOBAL.db.model('checkout')
		.findByIdAndUser(req.params.id, req.user)
		.exec(function (err, doc) {
			if(err || _.isEmpty(doc))
				return next(err || new Error('No exist'));
			res.locals.css.push( 'ng-checkout' );
			req.page.push('details');
			data.checkout = doc;
			data.type = 'shop';
			data.name = 'shop';
			data.base = 'template';
			next(data);
		});
};

/**
 * Obteniendo para -Imprimir-
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports.print = function (req, res, next ) {
	var data = { print : true, seller : req.params.name === 'sell' };
	GLOBAL.db.model(req.params.name === 'sell' ? 'checkout' : 'checkin')
		.findByIdAndUser(req.params.id, req.user)
		.deepPopulate('baucher.seller baucher.item')
		.exec(function (err, doc) {
			if(err || _.isEmpty(doc))
				return next(err || new Error('No exist'));
			res.locals.css.push( 'ng-' + req.params.name );
			req.page.push('print');
			data.is = req.params.name === 'sell' ? 'checkout' : 'checkin';
			data.form = req.params.name;
			data.check = doc;
			data.type = 'shop';
			data.name = 'shop';
			data.base = 'template';
			next(data);
		});
};