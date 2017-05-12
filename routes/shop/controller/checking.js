module.exports.view = function (data) {
	var socket = this;
	GLOBAL.db.model('baucher')
		.find({
			shop	: socket.client.request.user._id,
			public  : true,
			checkIn : { $exists: true }
		})
		.populate('item')
		.populate('seller')
		.populate('checkIn')
		.skip( data.pag * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.exec(function (err, docs){
			if(err) socket.emit( 'error', err );
			socket.emit('view', docs );
	});
};

module.exports.add = function (data) {
	var socket = this;
	var toSend = {};
	var checkin = new ( GLOBAL.db.model('checkin') )({
		who : socket.client.request.user._id,
		method : data,
		total : 0
	});
	GLOBAL.async.waterfall([
		function (callback){
			GLOBAL.async.map(socket.client.request.session.cart, function (num, cb){
				GLOBAL.db.model('item')
					.findById( num, function (err, doc) {
					if( err || _.isEmpty(doc) || !doc.sell.is )
						return cb( null, null );
					var item = new ( GLOBAL.db.model('baucher') )({
						//checkIn : checkin._id,
						item	: doc._id,
						price	: doc.sell.price,
						shop	: socket.client.request.user._id,
						seller	: doc.creator,
					});
					checkin.total += item.price;
					checkin.baucher.push(item._id);
					item.save( cb );
				});
			}, callback);
		},
		function (docs, callback) {
			GLOBAL.db.model('lang').findById(socket.client.request.session.lang._id, callback);
		},
		function (lang, callback){
			checkin.createPayment({
				title : lang.words.itemsell || 'prueba',
				descrip : lang.words.descipsell || 'prueba',
				url : GLOBAL.CONFIG.servers.shop.url
			}, callback);
		},
		function (dat, callback){
			toSend = _.clone(dat);
			checkin.save(function (err, da) {
				callback(err, dat);
			});
		}
	], function (err) {
		if(util.isError(err) ) socket.emit( 'error', err );
		socket.emit('view:checkin', toSend );
	});
};

module.exports.one = function (data) {
	var socket = this;
	GLOBAL.db.model('baucher')
		.findByUserAndCheckin( socket.client.request.user._id, data.nit)
		.populate('seller')
		.populate('item')
		.populate('checkIn')
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.exec(function (err, docs){
		if(err) socket.emit('error', err);
		socket.emit('view', docs );
	});
};


module.exports.count = function (data) {
	var socket = this;
	GLOBAL.db.model('baucher')
		.count({
			shop	: socket.client.request.user._id,
			public  : true,
			checkIn : { $exists: true },
			'dates' : {
				$gte : socket.client.request.user.connect.notic.bays
			}
		}, function (err, dt) {
			if(err) socket.emit('error', err);
			socket.emit('notify:bays', dt );
		});
};