const passport = require('./middleware/passport');
const bodyParser = require('body-parser');

var app = express();
var server = require('http').createServer( app );
var io = require('socket.io')(server, GLOBAL.CONFIG.response['socket.io']);

io.set('authorization', require('./api/controller/segurity'));
io.use(require('./api/controller/domain') );
io.use(require('./api/controller/socket') );

io.sockets.on('connection', require('./api/controller/connection'));

app.set('query parser', require('node-qs-serialization').deparam);
app.set('view engine', 'jade');

if( GLOBAL.CONFIG.response.compress.html ){
	app.set('view cache');
	app.set('trust proxy', true);
	app.disable('x-powered-by');
	app.use(require('express-extras').throttle(GLOBAL.CONFIG.response['timeout resp']));
	app.use(require('./middleware/sender'));
} else {
	app.use(require('morgan')(':method :url :status :response-time ms - :res[content-length]'));
}

app.use(require('compression')(GLOBAL.CONFIG.response['compress resp']));
app.use(require('serve-favicon')(path.join(GLOBAL.dir, 'public', 'favicon.ico')));

app.use(require('cookie-parser')()); //Parerear Cookies
app.use(require('./middleware/session'));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

app.use( passport.initialize()); //Obtenido usuario
app.use( passport.session()); // Obteniendo usuario

app.use(require('./middleware/hearders'));
app.use(require('flash')());

app.use(require('./middleware/lang'));
app.use(require('./middleware/user'));
app.use(require('./middleware/locals'));

app.all('/browserconfig.xml',require('./middleware/basic')(null,'browserconfig','application/xml',true));
app.all('/PolicyFileSocket.xsd',require('./middleware/basic')(null,'crossdomain','application/xml',true));
app.all('/crossdomain.xml', require('./middleware/basic')(null,'crossdomain','application/xml',true));
app.all('/sitemap.xml',require('./middleware/basic')(null, 'sitemap','application/xml', true));
app.all('/robots.txt',require('./middleware/text')('robots'));
app.all('/humans.txt',require('./middleware/text')('humans'));
app.all('/:sessionid.error',require('./middleware/basic')(null,'error','text/html',true));

var list = [];
for ( var x in GLOBAL.CONFIG.servers)
	list[ GLOBAL.CONFIG.servers[x].index ] = x ;

list = list.reverse();

for (var i = list.length - 1; i >= 0; i--){
	if( _.isString(list[i]) ){
		var result = require('./' + list[i]);
		if( result.get('host-regex') )
			app.use(require('vhost')(result.get('host-regex'),result));
		else
			app.use( result );
	}
}

/**
 * Inciador de servidores y escucha  el puerto
 * @param  {Function} callback Retorno de infomracion
 */
module.exports = exports = function (callback) {
	server.listen( GLOBAL.CONFIG.response.server.port, function (){
			console.log('NodeJs : %s - v8 : %s - openSSL : %s - %s - Port:',
				process.versions.node,
				process.versions.v8,
				process.versions.openssl,
				process.env.NODE_ENV || 'Devolper',
				GLOBAL.CONFIG.response.server.port);
			if(_.isFunction(callback) ) callback();
		});
};