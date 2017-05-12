module.exports.forAll = function (data) {
	var socket = this;
	async.parallel({
		like : function(cb){
			GLOBAL.db.model('feed').item(socket.client.request.user, data, cb);
		},
		down : function (cb) {
			GLOBAL.db.model('baucher').findItemAndUser(data, socket.client.request.user, cb );
		},
		count : function (cb) {
			GLOBAL.db.model('feed').likes(data, cb);
		}
	}, function (err, rs){
		if(err) socket.emit('error', err);
		rs.like = rs.like ? rs.like.toJSON() : {};
		rs.like.down = !!rs.down;
		rs.like.count = rs.count;
		if(!rs.like.how) rs.like.how = data;
		socket.emit('feedback', rs.like);
	});
};

module.exports.favorite = function (data) {
	var socket = this;
	if(_.isEmpty(data) )
		return;
	GLOBAL.db.model('feed').changes('favo', socket.client.request.user, data.id, function (err, doc) {
		if(err) socket.emit('error', err);
		socket.emit('feedback', doc);
	});
};

module.exports.like = function (data) {
	var socket = this;
	if(_.isEmpty(data) )
		return;
	GLOBAL.db.model('feed')
		.changes('like', socket.client.request.user, data.id, function (err, doc) {
		if(err) socket.emit('error', err);
		socket.emit('feedback', doc);
	});
};
