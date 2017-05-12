/**
 * Removedor de Comrpas
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function(req, res, next){
	if( _.isEmpty(req.query) )
		return next( new Error('Invalid') );
	GLOBAL.db.model('checkin')
		.findById(req.params.id)
		.populate('baucher')
		.exec(function (err, check) {
		if(err || _.isEmpty(check))
			return res.redirect(GLOBAL.CONFIG.servers.shop.url + 'cart');
		async.map(check.baucher, function (item, done) {
			item.remove(function (err) {
				done(err);
			});
		}, function (err) {
			check.remove(function (err) {
				if(err) return next( err);
				res.redirect(GLOBAL.CONFIG.servers.shop.url + 'cart');
			});
  		});
	});
};
