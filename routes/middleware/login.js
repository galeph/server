/**
 * Preguntar si esta Logeado
 * @param  {Boolean} is Esta Logeado
 * @return {Function}   Ejecucion por peticion
 */
module.exports = function(is){
	return function (req, res, next){
		var user = _.has( req, 'user' ) && !_.isEmpty( req.user );

		if(is){
			next( user ? null : new Error('Is login and enter force') );
		} else{
			next( !user ? null : new Error('Not login and enter force') );
		}
	};
};
