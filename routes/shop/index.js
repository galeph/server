/*
 * GET home page.
 */
const template = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'template' ));
const basic = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'basic' ));
const gateway = require('./controller/gateway');
const check =  require('./controller/render');
const login  = require('../middleware/login');

var app	= express();

/**
 * Consturyendo Class en el HTML
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
var classes = function (req, res, next) {
	res.locals.css = [ 'ng-shop'];
	next();
};

/**
 * Consturyendo Limpiar carro de compras
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
var clean = function (req, res, next) {
	req.session.cart = [];
	next();
};

_.extend(GLOBAL.CONFIG.servers.shop, lib.urlServer('shop'));

app.set('host-regex', GLOBAL.CONFIG.servers.shop.reg );
app.set('name', 'shop' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill

app = require('../middleware/params')(app);

app.param('paysys',	gateway('get') );
app.param('sensys',	gateway('send') );
//app.all('/pdf/:id', print );
app.all('/pay/cancel/:id', login(true), require('./controller/cancel') );
app.all('/:sessionid.in-details/:id', login(true), clean, require('./controller/confirm'), check.in );
app.all('/:sessionid.out-details/:id', login(true), check.out, template('shop') );
app.all('/:sessionid.:template', require('../middleware/clean'), template('shop', {
	cart : true,
	name : 'shop'
}));

app.all('/:name(pay|sell)/:id/print', login(true), check.print); // La lista de urls que funcionan
app.all('/:name(cart|pay|sell)/:id?', classes, basic('shop', 'home', 'text/html' )); // La lista de urls que funcionan

module.exports = require('../middleware/render')(app);
