/**
 * Test de certificados
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next){
	 if(!req.secure && GLOBAL.CONFIG.response.ssl)
		return res.redirect(['https://', req.get('Host'), req.url].join(''));

	next();
};