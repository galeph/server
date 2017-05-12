const template = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'template' ));
const login  = require('../middleware/login');
const home = require('./controller/home');

var app	= express();
_.extend(GLOBAL.CONFIG.servers.www, lib.urlServer('www'));
app.set('name', 'www' ); //Dice que tipo de servidor es
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill

app = require('../middleware/params' )(app);

app.all('/:sessionid.settings-account',	login(true), home.account,	template('www') );
app.all('/:sessionid.settings-extend',	login(true), home.extend,	template('www') );
app.all('/:sessionid.:template', require('../middleware/clean'), template('www') );
app.all([
	'/:name(wellcome|news)?',
	'/settings/:tabs?'
], home );

module.exports = require('../middleware/render')(app);
