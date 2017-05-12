/**
 * Funcion Inicio de usuario
 * @param  {Object} data Objecto Master
 */
module.exports = function (data) {
	var socket = this;
	GLOBAL.db.model('user').findToFollow({
		public : true,
		certi  : true
	}).exec(function (err, all) {
		if(err) socket.emit('error', err);
		GLOBAL.db.model('item')
			.findTimeLine(socket.client.request.user, all, {
				// date : {
				// //	$gte :  new Date(data.date)
				// },
				public : true
			})
			.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
			.limit( GLOBAL.CONFIG.response['item for page'] )
			.sort('-dateCr')
			.exec(function (err, result) {
				if(err) socket.emit('error', err);
				socket.emit('view', result);
			});
	});
};