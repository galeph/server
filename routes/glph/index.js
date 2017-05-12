const maker = require('./controller/maker');
const dots  = require('./controller/dots');
const alls  = require('./controller/all');
const cache = require('cachewatch')(GLOBAL.CONFIG.key.cachewatch);

var app = express();

_.extend(GLOBAL.CONFIG.servers.glph, lib.urlServer('glph'));

app.set('host-regex', GLOBAL.CONFIG.servers.glph.reg );
app.set('name', 'import' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill

app = require('../middleware/params' )(app);

app.all('/:sessionid.item/:nit',  maker('template', 'item'), require('./controller/item') );
app.all('/:sessionid.album/:slug([a-z|0-9|_|-]{2,16})', maker('template', 'album'), require('./controller/album') );
app.all('/:sessionid.:template', maker('template'));

app.use(['/', '/album/*','/:slug', '/followers', '/following'], cache.watch );

app.all([
	'/',
	'/followers',
	'/following'
], maker('page'), dots );

app.all('/album/*', maker('page'), dots, alls.album );
app.all('/:slug', maker('page'), dots, alls.item );

module.exports = require('../middleware/render')(app);
