const regex = {
	apodo: /^[a-z]{1}[a-z0-9_-]{3,13}[a-z|0-9]{1}$/i,
	admin: /^(?:[a-z|0-9]{40,40})$/i,
	render : /^(?:[a-z|0-9]{16,16})$/i,
	nit: /^[a-z|0-9|_|-]{16}$/i,
	tamano: /^[0-9]{0,4}x[0-9]{0,4}$/i,
	id: /^(?:[a-f|0-9]{24})$/i,
	img : /^(jpg|gif|png|ico)$/
};

function nit (req, res, next, valor, name){
	var test;
	var uno = GLOBAL.lib.base['64'].decode( valor );
	if( regex.id.test( uno ) && regex.nit.test( valor ) ){
		req.params[ name ] = uno;
		test = null;
	} else {
		test = 'route';
	}
	next( test );
}

function existe (req, res, next, valor, name){
	var reg = regex[ name ];
	var test = !_.isEmpty( valor ) && reg.test( valor ) ? null : 'route' ;
	next( test );
}

function sessionid (req, res, next, valor ){
	var test = lib.base['32'].decode( valor.toString() ) === req.sessionID ? null : new Error('Session no repsond base 32');
	next( test );
}

function file (req, res, next, valor, name ){
	req.params[ name ] = ( new Buffer(req.params[ name ], 'hex' ) ).toString('utf8');
	next();
}

function base (req, res, next, valor, name ){
	var jz = lib.base[ '32' ].decode( req.params[ name ] );
	try {
		jz = JSON.parse(jz);
		if(!_.isArray(jz))
			throw new Error('No exist');
		
		req.params[ name ] = jz;
		next();
	} catch(e){
		next(e);
	}
}
/**
 * Configurador de parametos
 * @param  {Object} app Instaciona de Expressjs
 * @return {Object}     Instaciona de Expressjs
 */
module.exports = function(app) {
	if( GLOBAL.CONFIG.response.compress.html ){
		app.set('view cache');
		app.disable('x-powered-by');
	}

	app.locals.search = true;
	app.locals.app = GLOBAL.CONFIG.response.angular;
	app.locals.version = process.env.npm_package_version;
	app.locals.configAPI = {
		path: GLOBAL.CONFIG.response['socket.io'].path,
		secure: GLOBAL.CONFIG.response.ssl
	};
	
	if( _.isObject(GLOBAL.CONFIG.response['socket.io'].client) )
		app.locals.configAPI.transports = GLOBAL.CONFIG.response['socket.io'].transports;

	_.extend(app.locals.configAPI, _.isObject(GLOBAL.CONFIG.response['socket.io'].client) ? GLOBAL.CONFIG.response['socket.io'].client : {});
	
	app.locals._ = _;
	app.locals.cacheLink = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'url' ));

	app.param(_.allKeys(regex), existe );
	app.param('sessionid',	sessionid );
	app.param('file',	file );
	app.param('nit',	nit );
	app.param('base',	base );

	return app;
};
