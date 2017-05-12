/**
 * Dar nueva fe
 * @param  {object} data Objecto que contiene la pagina y poscion del usuario
 */
module.exports = function(data) {
	var socket = this;
	GLOBAL.db.model('user').findById(socket.client.request.user, function (err, user){
		if(err) return socket.emit('error', err);
		GLOBAL.db.model('item').findNotify( user, data.pag, GLOBAL.CONFIG.response['item for page'], 'exec', function (err, docs){
			if(err) socket.emit('error', err);
			user.nuevaFecha( 'noti' );
			user.save(function (err) {
				if(err) console.error(err);
				socket.emit('view', docs);
			});
		});
	});
};
