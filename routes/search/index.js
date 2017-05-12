/*
 * GET home page.
 */

const template = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'template' ));
const basic = require(path.join(GLOBAL.dir, 'routes', 'middleware', 'basic' ));
var app	= express();
/**
 * Construcion de Clases para HTML y prueba de busqueda
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
var before = function (req, res, next) {
	if( _.isEmpty(req.query) && !req.params.name )
		return res.redirect(GLOBAL.CONFIG.servers.www.url);
	res.locals.css.push( 'home' );	
	next();
};
_.extend(GLOBAL.CONFIG.servers.search, lib.urlServer('search'));

app.set('host-regex', GLOBAL.CONFIG.servers.search.reg );
app.set('name', 'search' ); //Dice que tipo de servidor es
app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill
app = require('../middleware/params' )(app);
app.all('/opensearch.xml', basic('search', 'open', 'application/xml' ) );
app.all('/:sessionid.:template', template('search') );
app.all('/:name(explore|top|image|video|user|audio)?', before, basic('search', 'home', 'text/html' ));

module.exports = require('../middleware/render')(app);

/*

search.galeph.com/?q={term} --> Todo
search.galeph.com/image?q={term} --> Todo
search.galeph.com/video?q={term} --> Todo
search.galeph.com/user?q={term} --> Todo
search.galeph.com/audio?q={term} --> Todo

*/
