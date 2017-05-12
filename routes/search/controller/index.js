// Modelos internos
var z = fs.readdirSync(__dirname);
for (var i = 0; i < z.length; i++)
	if( z[i] != 'index.js' )
		module.exports[ _.strLeftBack(z[i], '.js') ] = require(GLOBAL.path.join( __dirname, z[i] ) );
