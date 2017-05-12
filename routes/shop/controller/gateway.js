/**
 * Obtecion de los sistemas de pagos/envio
 * @param  {String} is Tipo de sistema
 * @return {Function}  Obtencion del reqest
 */
module.exports = function (is) {
	const gateway = lib.gateway();
	return function (req, res, next, valor){
		var pay = gateway.payment( valor, is );
		if( _.isEmpty(pay))
			return next( 'route' );

		next();
	};
};
