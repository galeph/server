module.exports.post = function(res, req, next){
	var nuevo = new ( GLOBAL.db.model('suscribe') )( req.body );
	nuevo.save(function(err, doc){
		res.json({
			error : err,
			suscribe : doc
		});
	});
};

module.exports.get = function(res, req, next){
	GLOBAL.db.model('suscribe').find(req.query, function (err, doc) {
		res.json({
			error : err,
			suscribe : doc
		});
	});
};
