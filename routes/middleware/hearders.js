
/**
 *  Contructor de CROS Domain
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next) {
	res.setHeader('X-Version', require(GLOBAL.dir + '/package.json').version );
	res.setHeader('Server', require('os').hostname() );
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin ||  '*');
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	if(req.method === 'OPTIONS')
		return res.status(202).end();

	next();
};
