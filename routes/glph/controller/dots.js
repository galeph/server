// Colector de subdominio prohidos
module.exports = function (data, req, res, next){
	GLOBAL.async.parallel({
		follower : function (callback) {
			GLOBAL.db.model('follow').ers(data.user).count(callback);
		},
		follow :  function (callback) {
			GLOBAL.db.model('follow').ing(data.user).count(callback);
		},
		albums : function (callback) {
			GLOBAL.db.model('albums').findByUser( data.user ).count(callback);
		},
		item : function (callback) {
			GLOBAL.db.model('item').findByUser(data.user ).count(callback);
		},
		favs :function (callback) {
			GLOBAL.db.model('feed').favorites(data.user).count(callback);
		}
	}, function (err, result) {
		if( err )
			return next( err || new Error('Not Found user') );
		_.extend(data, result);
		next(data);
	});
};
