/**
 * Render basico de *ML
 * @param  {String} server Nombre del servidor
 * @param  {string} name   Nombre de la plantilla
 * @param  {String} type   Tipo de contenido
 * @param  {Boolea} is     Localizacion en API
 * @return {Fucntion}      ejecucion de una peticion
 */
module.exports = function (server, name, type, is){
	var page = path.join(__dirname, '..', 'api', 'views');
	return function (req, res){
		if(is) req.page = _.clone([page]);
		if(type) res.contentType( type );
		req.page.push(name);

		res.render( req.page.join('/'), {
			name : server,
			query: req.query,
			body : req.body
		});
	};
};
