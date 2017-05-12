const imagemagick = require('imagemagick-stream');

module.exports = function (req, res, next) {
	var isTop = req.params.is === 'cover';
	var list = {
		comand : 'convert',
		args : imagemagick().thumbnail( req.params.tamano + '^' ).gravity( 'center' ),
		stream : fs.createReadStream( path.join( GLOBAL.dir, 'public', isTop ? 'portada.png' : 'avatar.png') ),
		date : new Date(),
		type : 'image/png'
	};

	list.render = list.stream.pipe(list.args);

	GLOBAL.db.model('user').findById(req.params.id, function (err, user) {
		if(err || _.isEmpty(user) )
			return next(err || new Error('No exist the user'));

		var id = isTop ? user.profile.porta : user.profile.avata;

		if( _.isEmpty(id) )
			return next(list);
		
		req.params.id = id.toString();

		next();
	});
};
