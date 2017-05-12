/*
 * Modificador
 *
 */
const login  = require('../middleware/login');
const time = 86400000;
const mime = require('mime');
const image = require('./controller/item');

var sender = function (exec, req, res, next) {
	if( GLOBAL.util.isError(exec) || !_.isObject(exec) || exec.message || !exec.render )
		return next( GLOBAL.util.isError(exec) ? exec : new Error('No exist the comand') );

	res.header('Last-Modified', ( new Date( exec.date ) ).toString() );
	res.contentType( mime.lookup( exec.type ) );
	if(!exec.download) res.setHeader('Expires', moment().add(time, 'ms').toString() );
	exec.render.on('error', function (e) {
		console.error(e);
		res.send();
	});
	exec.render.pipe(res);
};

var app = express();

_.extend(GLOBAL.CONFIG.servers.embe, lib.urlServer('embe'));

app.set('host-regex', GLOBAL.CONFIG.servers.embe.reg );
app.set('name', 'embe' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill
app = require('../middleware/params' )(app);
//app.use( routes.vars );
//TODO app.use( lib.segurity.basic );

app.get('/:tamano/:id.album', require('./controller/album'), sender);
app.get('/:tamano/:id.user.:is(avatar|cover)', require('./controller/avatar'), image, sender);

app.get('/:tamano.image/:sessionid.:id.:is', image, sender );
//app.get('/:calidad.video/:sessionid.:id.:is', vie);
//app.get('/:calidad.audio/:sessionid.:id.:is', aud);

// Download
app.get('/:id', login(true),  require('./controller/download'), sender);

module.exports = require('../middleware/render')(app);
