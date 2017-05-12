/**
 * Obtener todos los itmes
 * @param  {Object} data Objecto master
 */
module.exports = function(data) {
	var socket = this;
	
	GLOBAL.db.model('item')
		.findByUser( data.id )
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.sort('-dateCr')
		.exec(function (err, doc){
			if(err) socket.emit('error', err);
			var result = [];

			for (var i = doc.length - 1; i >= 0; i--)
				result.push( doc[i].toSOCKET(socket.client.request.user) );

			socket.emit('view',  result.reverse() );
	});
};

/**
 * Segui* Meotod para obtener Segidores/Siguiendo
 * @param  {string} name Tipo de lo que se esta obteniendo
 * @param  {Object} data Objecto master
 */
module.exports.follow = function (name, data) {
	var is = name === 'ers' ? 'form' : 'how';
	var socket = this;
	GLOBAL.db.model('follow')[name](data.id)
		.populate( is )
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.sort('-date')
		.exec(function (err, doc) {
			if(err) socket.emit('error', err);
			var result = [];

			for (var i = doc.length - 1; i >= 0; i--)
				result.push( doc[i][ is ] );

			socket.emit('view',  result.reverse() );
		});
};