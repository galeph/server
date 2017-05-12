var Principal = function (){
	var mongo = require('mongoose');
	require('humanquery')( mongo );
	require('mongoose-for-types').loadTypes( mongo );

	var uri = require('mongodb-uri').formatMongoose(GLOBAL.CONFIG.db.href || url.format(GLOBAL.CONFIG.db));
	mongo.connect(uri, GLOBAL.CONFIG.db.opts, function (err, res) {
		if(err) console.log('ERROR connecting to: ' + uri + '. ' + err);
	});

	// Sistema
	models.lang( mongo );
	models.links( mongo );
	models.country( mongo );

	// Usuario
	models.user( mongo );
	models.external( mongo );
	models.follow( mongo );
	models.session( mongo );

	// Items
	models.item( mongo );
	models.comment( mongo );
	models.tag( mongo );
	models.album( mongo );
	models.feed( mongo );

	// Publicidad
	models.ads( mongo );

	// Tienda
	models.baucher( mongo );
	models.checkin( mongo );
	models.checkout( mongo );
	models.cupon( mongo );

	// Landing
	models.suscribe( mongo );
	models.live( mongo );

	//mongo.connection.on('disconnected', console.error.bind(console, 'Disconnect'));
	//mongo.connection.on('error', console.error.bind(console, 'Connection Error - MongoDB:'));

	return mongo;

};

exports.principal = Principal;

// Modelos internos
var models = {};
var z = fs.readdirSync(__dirname);
for (var i = 0; i < z.length; i++)
	if( z[i] != 'index.js' )
		models[ GLOBAL._.strLeftBack(z[i], '.js') ] = require(GLOBAL.path.join( __dirname, z[i] ) );

