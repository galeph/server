module.exports = function (req, res, next){
	var result = {};

	if(req.params.name)
		result.types = req.params.name;

	if( /top/i.test(req.params.name) ){
		GLOBAL.db.model('baucher').findAndCompact({
			date: {
				$lte : moment().subtract(1, req.query.time)
			},
			checkIn :{ $exists :true }
		}).exec(function (err, da) {
			var que = { public : true, $or : [] };
			for (var i = 0; i < da.length; i++)
				que.$or.push({ _id : da[i].item });

			if(que.$or.length === 0)
				delete que.$or;

			GLOBAL.db.model('item').find(que)
				.populate('creator')
				.limit( req.query.limit )
				.skip( req.query.page * req.query.limit )
				.exec(function (err, items) {
					if( err )
						return next( err || new Error( 'Invalid' ) );
					result.title = 'top';
					result.items = items;
					next(result);
				});
		});
	} else if( /explore/i.test(req.params.name) ){
		GLOBAL.db.model('feed').find({
			view: {
				$lte : moment().subtract(1, req.query.time)
			}
		}).select('-form').exec(function (err, da) {
			if( err )
				return next( err || new Error( 'Invalid' ) );
			var que = { public : true, $or : [] };
			for (var i = 0; i < da.length; i++)
				que.$or.push({ _id : da[i].how });

			if(que.$or.length === 0)
				delete que.$or;

			GLOBAL.db.model('item').find(que)
				.populate('creator')
				.limit( req.query.limit )
				.skip( req.query.page * req.query.limit )
				.exec(function (err, items) {
					if( err )
						return next( err || new Error( 'Invalid' ) );
					result.title = 'explore';
					result.items = items;
					next(result);
				});
 		});
 	} else {
 		GLOBAL.db.model('item').find({ public : true })
			.populate('creator')
			.limit( req.query.limit )
			.skip( req.query.page * req.query.limit )
			.sort('-dateCr')
			.exec(function (err, items) {
				if( err )
					return next( err || new Error( 'Invalid' ) );
				result.title = 'all';
				result.items = items;
				next(result);
			});
 	}
};
