/*
 * GET home page.
 */
const login  = require('../middleware/login');
const maker  = require('./controller/maker');

var app = express();
/**
 * Peticion del idioma
 * @param  {object} req Peticion
 * @param  {object} res Respuesta
 */
var lang = function (req, res) {
	res.json({
		error: _.has( req.query, 'tag') ? null : new Error('Invalid tag'),
		word : _.has( req.query, 'tag') ? res.locals.gettext(req.query.tag) : null
	});
};

/**
 * Construcion del los nombre y ID the angular
 */
var app = function () {
	var obj = GLOBAL.CONFIG.response.angular = {
		file : GLOBAL.lib.base['32'].encode(process.env.npm_package_version),
		name : GLOBAL.lib.base['64'].decode(process.env.npm_package_version)
	};
	return function (req, res) {
		res.json(obj);
	};
};

_.extend(GLOBAL.CONFIG.servers.api, lib.urlServer('api'));

app.set('host-regex', GLOBAL.CONFIG.servers.api.reg );
app.set('name', 'api' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill
app = require('../middleware/params' )(app);
app.use( require('../middleware/mailer') );

app.all('/app', app());
app.all('/lang', lang);
app.post('/maker/sus', maker.post);
app.get('/maker/sus', maker.get);
app.get('/method/:name(send|get)', require('./controller/gateway') );
app.post('/test/:typx(mail|nick|user)', require('./controller/test') ); //Pobando Nick y Emails

//TODO app.post('/deleteuser/:uis', login(true), remove);
module.exports = require('../middleware/render')(app);
