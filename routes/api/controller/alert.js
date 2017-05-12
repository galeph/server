/**
 * Eliminador de alertas
 * @param  {String} ds Nombre de la alerta
 */
module.exports = function (ds) {
	var socket = this;
	var res = new RegExp(ds, 'gim');
	GLOBAL.db.model('session').findMe( socket.client.request.sessionID, function (err, session){
		if(err) socket.emit('error', err);
		var data = _.clone(session.data);
		var item = _.find(data.flash, function (item) {
			return res.test(item.message);
		});
		data.flash = _.without(data.flash, item);
		session.data = data;
		session.save(function (err) {
			if(err) socket.emit('error', err);
		});
	});
};
/**
 * Funcion para desconectar
 * @param  {object} socket Socket de coneccion de usuario
 */
module.exports.disconnect = function (socket) {
	return function(){
		if( !_.isEmpty(socket.client.request) || !_.isEmpty(socket.client.request.user) || socket.client.request.user._id ){
			GLOBAL.db.model('user').Connect(socket.client.request.user._id, false, function (err){
				if(err) console.error(err);
			});
		}
	}
};
/**
 * Funcion para hacer test, la devuelve
 * @param  {String|Object|Number|Boolean} data Cualquier informacion
 */
module.exports.test = function (data) {
	this.emit('test', data);
};