/**
 * Archivos estaticos de Textp
 * @param  {String} name Nombre del archivo
 * @return {Function}    Funcion de la ejecucion para envio
 */
module.exports = function(name){
	return function (req, res) {
		res.contentType('text/plain');
		res.send(name == 'robots' ? GLOBAL.CONFIG.basic[ name ].join('\n') : res.locals.gettext(name) );
	};
};
