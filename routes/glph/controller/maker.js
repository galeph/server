/**
 * Contructor del usuario
 * @param  {String} is   Tipo de plantilla
 * @param  {String} name Array de la plantilla
 * @return {Function}    Funcion de ejecicion de la peticion
 */
module.exports = function (is, name) {
	return function (req, res, next){
		var data = {};
		GLOBAL.db.model('user').findByUser(req.vhost['0']).exec('findOne', function (err, doc){
			if( err || _.isEmpty(doc) )
				return next(err || new Error('Not Found') );
			res.locals.css.push( 'ng-profile' );
			if( is === 'page' ) req.page.push('home');
			if( is === 'template' )
				req.page = ( name || req.params.template ).split('-');

			data.user = doc;
			data.type = 'glph';
			data.name = 'glph';
			data.base = is;
			next(data);
		});
	};
};
