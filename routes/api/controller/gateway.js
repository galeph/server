/**
 * Constructor de sistemas de pagos segun pais del usuario
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next) {
	var getway = lib.gateway();
	var list = [];
	for (var i = req.country.method.length - 1; i >= 0; i--) {
		var este = getway.payment(req.country.method[i], req.params.name );
		if(este){
			list.push({
				name : este.name, // Traducir
				tax : este.tax,
				more : este.more,
				look : este.name,
				class : este.icon
			});
		}
	}
	res.send(list);
};
