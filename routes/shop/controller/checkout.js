/**
 * isPopulate Obtecion de multiples documentos en pyectos
 * @param  {Function} fucn Funcion de retorno
 * @return {Function}      Funcion ejecutada
 */
function isPopulate (fucn){
	return function (e, d) {
		if(e) return fucn(e);
		GLOBAL.db.model('item').populate(d, { path : 'item' }, fucn);
	}
}
/**
 * Obtecion de informacion para vendidos
 * @param  {Objecto} data Objecto Master
 */
module.exports.view = function (data) {
	var socket = this;
	GLOBAL.db.model('baucher')
		.findBySeller({
			seller	: socket.client.request.user._id,
			public	: true,
		}, !data.nit ? { $exists: true } : null, data.nit || { $exists: false })
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.exec(isPopulate(function (err, docs) {
			if(err) socket.emit('error', err);
			socket.emit('view', docs );
		}));
};

/**
 * Funcion de aregacion de de descarga 
 * @param {Object} data Object master
 */
module.exports.add = function (data) {
	var socket = this;
	GLOBAL.db.model('user').findById(socket.client.request.user._id, function (err, doc){
		if( doc && _.isString(data.review) && doc.isValidPassword( data.review ) ){
			var checkout = new ( GLOBAL.db.model('checkout') )({
				who : doc,
				method : data.method,
				data : data.info,
				total : 0
			});

			var array = [];
			for (var i = data.items.length - 1; i >= 0; i--){
				var its = data.items[i];
				for (var j = its.table.length - 1; j >= 0; j--) {
					array.push(its.table[j].baucher);
				}
			}

			GLOBAL.db.model('baucher').findByIdsAndSeller(array, doc, function (err, docs) {
				if(err) socket.emit('error', err);
				async.map(docs, function (item, next) {
					item.checkOut = checkout._id;
					checkout.baucher.push(item._id);
					checkout.total += item.price;
					item.save(next);
				}, function (err) {
					if(err) socket.emit('error', err);
					checkout.save(function (err, check) {
						if(err) socket.emit('error', err);
						socket.emit('add:checkout:ok', check);
					});
				});
			});
		}else{
			socket.emit('add:checkout:ok', {
				error : 'Is not a password',
				success_url : GLOBAL.CONFIG.servers.shop.url + 'sell'
			});
		}
	});
};

/**
 * Tabla de descagas
 * @param  {Object} data Objecto master
 */
module.exports.table = function (data) {
	var socket = this;
	GLOBAL.db.model('checkout').find({
		who : socket.client.request.user._id
	}, function (err, doc) {
		if(err) socket.emit('error', err);
		socket.emit('view:table', doc);
	});
};

/**
 * Funcion de contador
 * @param  {String|Boolean|Object|Null} data No importa
 */
module.exports.count = function (data) {
	var socket = this;
	GLOBAL.db.model('baucher')
		.count({
			seller	: socket.client.request.user._id,
			public	: true,
			checkIn: { $exists: true },
			checkOut : { $exists: false },
			dates : {
				$gte : socket.client.request.user.connect.notic.sell
			}
		}, function (err, dt) {
			if(err) socket.emit('error', err);
			socket.emit('notify:sell', dt );
		});
};