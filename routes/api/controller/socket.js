
//Desde Aqui
/**
 * Obtecion del usuario
 * @param  {object}   socket Socket conectado
 * @param  {Function} next   Funcion para seguir
 */
module.exports = function (socket, next){
	if( _.isEmpty(socket.client.request) || _.isEmpty(socket.client.request.user) )
		return next && next();
	GLOBAL.db.model('user').Connect(socket.client.request.user._id, true, function (err){
		return next && next(err);
	});
};
