const template = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'template' ));
const basic = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'basic' ));
const contact  =  require('./controller/contact');
var app = express();

_.extend(GLOBAL.CONFIG.servers.import, lib.urlServer('import'));

app.set('host-regex', GLOBAL.CONFIG.servers.import.reg );
app.set('name', 'import' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill
app.use( require('../middleware/login' )( true ) );
app = require('../middleware/params' )(app);

app.all('/:sessionid.contact-:provi(google)', contact, contact.google, contact.update, template('import') );
app.all('/:sessionid.contact-provi(yahoo)', contact, contact.yahoo, contact.update, template('import') );

app.all('/:sessionid.:template', template('import') );
app.all([
	'/',
	'/contact/:name?',
	'/video/:name?',
	'/audio/:name?',
	'/image/:name?'
], basic('import', 'home', 'text/html' ) );

module.exports = require('../middleware/render')(app);
