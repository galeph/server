
/**
 *  Contructor de Platillas modulares
 * @param  {string} name    Nombre del tipo de servidor
 * @param  {Object} options Objecto de funciones/informacion adicionales
 * @return {Fucntion}       Funcion de ejecucion de salida
 */
module.exports = function (name, options){
	return function ( req, res, next) {
		res.locals.classes.push( req.params.template );
		var tem = req.params.template.split('-');
		for (var i = 0; i < tem.length; i++)
			req.page.push(tem[i]);

		next(_.extend({
			base : 'template',
			type : name,
			template : req.params.template,
			query : req.query,
			body : req.body
		}, options));
	};
};
