module.exports.all = function (query, cb){
	var socket = this;
	var exrp = { $regex: query, $options: 'i' };
	GLOBAL.db.model('user').find({
		public : true,
		$nor : [{ _id : socket.client.request.user._id, public : false } ],
		$or : [{
			'propfile.apodo' : exrp,
		},{
			'propfile.nombr' : exrp,
		}]
	}).limit(5).exec(function (err, doc) {
		if(err) socket.emit('error', err);
		cb(doc);
	});
};

module.exports.to = function (num, cb){
	var socket = this,
		query = {
			public : true,
			_id : {
				$nin : [ socket.client.request.user._id	]
			}
		};
	GLOBAL.async.waterfall([
		function (callback) {
			GLOBAL.db
				.model('follow')
				.me(socket.client.request.user, callback);
		},
		function (all, callback) {
			for (var i = all.length - 1; i >= 0; i--)
				query._id.$nin.push(all[i]._id.toString() );

			callback(null, query);
		},
		function (query, callback) {
			GLOBAL.db.model('user')
				.count(query, callback);
		},
		function (n, callback) {
			GLOBAL.db.model('user')
				.find(query)
				.limit(1)
				.skip(_.random(0, n) + num)
				.exec(callback);
		}
	], function (err, docs) {
		if(err) socket.emit('error', err);
		cb(docs[0]);
	});
};