module.exports = function(req, res, next){
	async.parallel({
		external :function (callback) {
			GLOBAL.db.model('connect').findOneAndRemove({
				user   : req.user._id,
				provid : req.params.sys,
				public : true
			}, callback);
		},
		user :function (callback) {
			GLOBAL.db.model('user').findById(req.user._id, function (err, doc) {
				if(err || _.isEmpty(doc)) return callback(err || new Error('Invalid'));
				 delete doc.connect.social[ req.params.sys ];
				 doc.save(callback);
			});
		}
	}, function (err, reslt) {
		if(err)
			return next(err);
		next();
	});
};
