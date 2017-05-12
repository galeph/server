const useragent	= require('useragent');
const geoip = require('geoip-lite');
const crawlerUserAgents = [
	'google',
	'yahoo',
	'bing',
	'baiduspider',
	'facebook',
	'twitter',
	'roger',
	'linkedin',
	'embedly',
	'quora',
	'showyou',
	'outbrain',
	'pinterest',
	'slack',
	'vkShare',
	'W3C_Validator',
	'bot',
	'CacheWatch'
];

require('useragent/features');
/**
 * Montaje tipo de cliento de uso y pais
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next) {
	const mobil = /ndroid|Phone|Pod|lackberry|okia|ymbian|mobile/i;
	const table = /ndroid|Pad|ebos/i;
	
	res.locals.agent = {};
	res.locals.agent.of = useragent.parse( req.headers['user-agent'], req.query.useragent);
	res.locals.agent.is = useragent.is( req.headers['user-agent'] );
	res.locals.agent.of.patch = parseFloat( res.locals.agent.of.patch );
	res.locals.agent.of.major = parseFloat( res.locals.agent.of.major );
	res.locals.agent.of.minor = parseFloat( res.locals.agent.of.minor );
	res.locals.agent.mobile = mobil.test(res.locals.agent.of.os) || mobil.test(res.locals.agent.of.family);
	res.locals.agent.tablet = table.test(res.locals.agent.of.os) || table.test(res.locals.agent.of.family);
	res.locals.agent.desktop = !( res.locals.agent.mobile || res.locals.agent.tablet );
	res.locals.agent.support = 
		res.locals.agent.is.firefox ? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].firefox ) :
		res.locals.agent.is.safari	? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].safari ) :
		res.locals.agent.is.chrome	? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].chrome ) :
		res.locals.agent.is.opera	? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].opera ) :
		res.locals.agent.is.ie		? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].ie ) :
		res.locals.agent.is.webkit	? res.locals.agent.of.satisfies( GLOBAL.CONFIG.response['agent support'].webkit ) :
		res.locals.agent.mobile || res.locals.agent.tablet;
	req.useragent = res.locals.agent;
	res.locals.agent.bot = _.find(crawlerUserAgents, function (item) {
		var reg = new RegExp( item, 'gim');
		return reg.test( req.headers['user-agent'] );
	});

	if( req.headers['x-bufferbot'] || res.locals.agent.bot )
		res.locals.agent.support = true;

	if ( res.locals.agent.is.ie )
		res.setHeader('X-UA-Compatible', 'IE=Edge');

	var query = req.headers['cf-ipcountry'] ? {
		country : req.headers['cf-ipcountry']
	} : geoip.lookup(req.ip);

	GLOBAL.db.model('country').findByIp( query, function sig (err, doc) {
		req.country = doc;
		next(err);
	});
};