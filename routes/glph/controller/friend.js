module.exports.view = function(data) {
	var socket = this;
	var datas = {
		id : data,
		is : null,
		me : socket.client.request.user._id.toString() === data
	};
	GLOBAL.db.model('follow').erThis(socket.client.request.user, data, function (err, doc) {
		datas.is = doc;
		if(err) socket.emit('error', err);
		if(doc){
			socket.emit(doc.public ? 'follow' : 'block', datas);
		}else  {
			socket.emit('follow', datas);
		}
	});
};

module.exports.add = function (id) {
	var socket = this;
	GLOBAL.async.parallel({
		lang : function (cb) {
			GLOBAL.db.model('lang').findById( socket.client.request.session.lang._id,  cb);
		},
		follow :function (cb) {
			GLOBAL.db.model('follow').CreateOrDelete( socket.client.request.user, id, true, cb);
		}
	}, function (err, res) {
		if(err) socket.emit('error', err);
		socket.emit('mesg:show', { mesg : res.lang.gettext( res.follow ? 'Is_friend' : 'no_friend' ) });
		socket.emit('follow', { is : res.follow, id : id });
	});
};

module.exports.block = function (id) {
	var socket = this;
	GLOBAL.async.parallel({
		lang : function (cb) {
			GLOBAL.db.model('lang').findById( socket.client.request.session.lang._id,  cb);
		},
		follow :function (cb) {
			GLOBAL.db.model('follow').CreateOrDelete( socket.client.request.user, id, false, cb);
		}
	}, function (err, res) {
		if(err) socket.emit('error', err);
		socket.emit('mesg:show', { mesg : res.lang.gettext( res.follow ? 'Is_block' : 'no_block' ) });
		socket.emit('block', { is : res.follow, id : id });
	});
};
