module.exports.view = function (data){
	var socket = this;
	var user = socket.client.request.user ? socket.client.request.user._id : null;
	GLOBAL.db.model('item')
		.findForCart( socket.client.request.session.cart, user )
		.populate('creator').exec(function (err, docs){
		if(err) socket.emit( 'error', err);
		socket.emit('view', docs);
	});
};

module.exports.add = function(id){
	var socket = this;
	GLOBAL.async.parallel({
		isMe : function (cb) {
			GLOBAL.db.model('item')
				.findForCart( _.isArray(id) ? id : [ id ], socket.client.request.user && socket.client.request.user._id  ? socket.client.request.user._id : null  )
				.count(cb);
		},
		isBay : function (cb) {
			GLOBAL.db.model('baucher').findItemAndUser(id, socket.client.request.user, cb );
		}
	}, function (err, res ){
		if(err) socket.emit( 'error', err);
		if( res.isMe === 0 || res.isBay )
			return socket.emit('notify:cart', socket.client.request.session.cart.length );

		GLOBAL.async.parallel({
			saver : function (cb) {
				GLOBAL.db.model('session')
					.findOneAndUpdate({
					sid : socket.client.request.sessionID
				},{
					$addToSet: {
						'data.cart'	: { $each: [ id ] }
					}
				}, cb);
			},
			lang : function (cb) {
				GLOBAL.db.model('lang')
					.findById( socket.client.request.session.lang._id, cb);
			}
		}, function (err, dox ){
			if(err) socket.emit('error', err);
			socket.client.request.session.cart = dox.saver.data.cart.length;
			socket.emit('notify:cart', dox.saver.data.cart.length );
			socket.emit('notify:shows', dox.lang.gettext('add_cart') );
		});
	});
};

module.exports.del = function(id){
	var socket = this;
	GLOBAL.async.parallel({
		saver : function (cb) {
			GLOBAL.db.model('session')
				.findOneAndUpdate({
				sid :socket.client.request.sessionID
			},{
				$pull : {
					'data.cart'	: id
				}
			}, cb);
		},
		lang : function (cb) {
			GLOBAL.db.model('lang')
				.findById( socket.client.request.session.lang._id, cb);
		}
	}, function (err, dox ){
		if(err) socket.emit('error', err);
		socket.client.request.session.cart = dox.saver.data.cart;
		socket.emit('notify:cart', dox.saver.data.cart.length );
		socket.emit('notify:shows', dox.lang.gettext('remove_cart') );
	});
};
module.exports.send = function(){
	var socket = this;
	socket.emit('notify:cart', socket.client.request.session.cart.length );
};
