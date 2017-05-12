const name = {
	'in' : 'bays',
	'out' : 'sell',
	'news' : 'news'
};
/**
 * Obtener nueva fecha segun la visita
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next) {
	var x = name[req.params.template];
	if(x && req.user){
		GLOBAL.db.model('user').findById( req.user._id, function (err, doc) {
			if(err || _.isEmpty(doc))
				return next(err || new Error('No exists'));
			doc.connect.notic[ x ] = new Date();
			doc.save(function (err) {
				next(err);
			});
		});
	} else {
		next();
	}
};