const imagemagick = require('imagemagick-stream');

module.exports = function(req, res, next) {
	GLOBAL.db.model('item').findById(req.params.id, function (err, item) {
		if(err || _.isEmpty(item))
			return next(err|| new Error('Not exist') );
		GLOBAL.async.parallel({
			see : function (callback) {
				item.getFile(callback);
			},
			magic : function(callback){
				var img = imagemagick();
				var width = _.toNumber( _.strLeft(req.params.tamano, 'x') );
				var heigth = _.toNumber( _.strRight(req.params.tamano, 'x') );
				if( width > 0 && heigth > 0 ){
					img
						.thumbnail( req.params.tamano + '^' )
						.gravity( 'center' );
					if(req.params.is)
						img.op('extent', req.params.tamano );
				} else {
					img.resize( heigth > 0 ? 'x' + heigth : width > 0 ? width + 'x' : '100x' );
				}

				callback(null, img );
			}
		}, function (err, arg) {
			if(err) return next(err);
			arg.render = arg.see.stream(true).pipe(arg.magic);
			arg.type = item.file.contentType;
			arg.date = item.date;
			next(arg);
		});
	});
};
