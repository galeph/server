/**
 * TL directa envia la informacion de la TL
 * @param  {Object} data Objecto master
 */
module.exports = function (data) {
	var socket = this;
	GLOBAL.async.waterfall([
		function(callback) {
			GLOBAL.db
				.model('follow')
				.me(socket.client.request.user, callback);
		},
		function(all, callback) {
			if(all.length >= 1){
				callback(null, all);
			} else {
				GLOBAL.db
					.model('user')
					.findToFollow({
						certi  : true
					})
					.exec(callback);
			}
		},
		function (all, callback) {
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
				.exec(callback);
		}
	], function (err, docs) {
		if(err) socket.emit('error', err);
		var result = [];

		for (var i = docs.length - 1; i >= 0; i--)
			result.push( docs[i].toSOCKET(socket.client.request.user) );

		socket.emit('view', result.reverse() );
	});
};
