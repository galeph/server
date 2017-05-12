const imagemagick = require('imagemagick-stream');

module.exports = function (req, res, next) {
	
	var isTop = req.params.is === 'top';
	var list = {
		comand : 'convert',
		args : imagemagick().thumbnail( req.params.tamano + '^' ).gravity( 'center' ),
		stream : fs.createReadStream( GLOBAL.path.join( GLOBAL.dir, 'public', 'blanco.png') ),
		date : new Date(),
		type : 'image/png'
	};

	GLOBAL.db.model('albumn').findById( req.params.id, function (err, album) {
		if(err || _.isEmpty(album) )
			return next(err || new Error('No exist the album'));

		if( !album.top )
			return next(list);

		GLOBAL.db.model('item').findById(req.params.id, function (err, item) {
			if(err)
				return next(err);

			if(!item || !item.isImage)
				return next(list);

			list.date = item.date;

			item.getFile(function (err, gs) {
				if(err) return next(list);
				list.stream = gs.stream(true);
				list.type = item.file.contentType;
				next(list);
			});
		});
	});
};
