GLOBAL.CONFIG   = require('konfig')();
/**
 * Iniciador de proceso
 * @param  {object}   options  Objecto de comandos
 * @param  {Function} callback funcion de retorno
 * @return {null}              Si no existe error, sigue.
 */
exports.start = function (options, callback){
	const cluster = require('cluster');

	if( options.cluster ? !cluster.isMaster : true )
		return require( path.join(GLOBAL.dir, 'routes', 'index.js') )(callback);

	cluster.setupMaster({ silent: false });
	console.log('NodeJs : %s - v8 : %s - openSSL : %s -',
		process.versions.node,
		process.versions.v8,
		process.versions.openssl,
		process.env.NODE_ENV || 'Devolper' );
	cluster
		.on('exit', function (worker, code, signal) {
			var err = new Error( 'Worker is died' );
			err.pid = worker.process.pid;
			err.code = code;
			err.signal = signal;
			console.error(err);
			cluster.fork();
		});
	for (var i = 0; i < GLOBAL.CONFIG.basic.cluster ; i++)
		cluster.fork();
	if(_.isFunction(callback) ) callback();
};

/**
 * Funcion de status de servicio
 * @param  {object} options Opciones de comando
 */
exports.status = function (options) {
	const request = require('request');
	var list = [ ];
	for( var server in GLOBAL.CONFIG.servers ){
		var url = GLOBAL.CONFIG.servers[server];
		url.protocol = 'http';
		url.pathname = '/' + options.path ;
		url.hostname = 'glph' == server ? 'staff.' + url.hostname : server + '.' + url.hostname;
		delete url.host;
		list.push(lib.urlServer(url));
	};
	async.map(list, request[ options.method || 'get' ], function (err, docs){
		if(err || _.isEmpty(docs))
			console.error(err || new Error('Is offLine!'));
		var i = 0;
		console.log('\n');
		for ( server in GLOBAL.CONFIG.servers ){
			var xp = _.isEmpty( docs[0] ) ? 'FAIL' : docs[0].statusCode;
			console.log('   * Server - %s  \t[%s]', server,  xp );
			i++;
		};
		console.log('\n');
		process.kill(this);
	});
};
