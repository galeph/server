/*
 * GET home page.
 */
const tester = require('../middleware/login');
const create = require('./controller/create');
const recover = require('./controller/recover');
const password = require('./controller/password');
const actives = require('./controller/actives');
const passport = require('../middleware/passport');
const callbacks = require('./controller/callback');
const recaptcha = require('../middleware/recaptcha')('auth', 4);

var app = express();
var login = function( req, res, next ) {
	req.page.push( 'login' );
	res.locals.css.push( 'login' );
	res.locals.css.push( 'auth' );
	next({
		title : res.locals.login_auth,
		include : 'login'
	});
};

var logout = function(req, res){
	req.logout();
	res.redirect( GLOBAL.CONFIG.servers.www.url );
};

var redirect = function(req, res, next){
	if(GLOBAL.util.isError(req))
		return next(req);
	var host,  is = req.gotos || '' ;
	if( req.query.ref && req.query.ref.length > 1 )
		return res.redirect(req.query.ref);

	if(req.headers.referer )
		host = GLOBAL.url.parse( req.headers.referer ).hostname;

	if( /galeph\.com/.test(host) )
		return res.redirect( ( /^auth\./i.test(host) ? GLOBAL.CONFIG.servers.www.url : req.headers.referer ) + is );
	
	res.redirect( GLOBAL.CONFIG.servers.www.url + is );
};

var segurity = function( req, res, next ){
	if( lib.base['32'].decode( req.body._csrf ) != req.sessionID )
		return next(new Error('Atact'));

	var mome = GLOBAL.moment().add( 5, req.body.noclose && req.body.noclose === 'noclose' ? 'M' : 'd' );
	req.session.cookie.maxAge =	new Date( mome );
	req.session.cookie.expires = mome.diff( GLOBAL.moment() );

	next();
};

_.extend(GLOBAL.CONFIG.servers.auth, lib.urlServer('auth'));

app.set('host-regex', GLOBAL.CONFIG.servers.auth.reg );
app.set('name', 'auth' ); //Dice que tipo de servidor es
app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill

app = require('../middleware/params' )(app);

app.use( require('../middleware/mailer') );
app.post('/mail/active/:id', tester(true), require('./controller/create').mail ); // TODO Esto debe cambiar

app.get('/facebook', passport.authenticate('facebook',{
	scope : ['public_profile', 'email', 'user_website'] }));
app.get('/google',	passport.authenticate('google', { scope: [
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/contacts.readonly'
	] }));
app.get('/yahoo',	passport.authenticate('yahoo')); 
app.get('/soundcloud',	passport.authenticate('soundcloud')); 

/* Descartados
app.get('/twitter',	passport.authenticate('twitter')); 
app.get('/tumblr',	passport.authenticate('tumblr')); 
app.get('/paypal',	passport.authenticate('paypal', { 
	scope: [ 'https://identity.x.com/xidentity/resources/profile/me', 'profile',
		'email', 'https://uri.paypal.com/services/paypalattributes' ],
	failureRedirect: '/login'})); 
*/

app.all('/callback/:sys', callbacks, callbacks.connect, redirect ); 
app.all('/disconnect/:sys', tester(true), require('./controller/disconnect'), redirect ); 

app.route('/login')
	.all( tester(false) )
	.get( login )
	.post( recaptcha )
	.post( segurity )
	.post( passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'invalido usuario clave' } ) )
	.post( redirect );

app.route( '/create' )
	.all( tester(false) )
	.get( create.get )
	.post( recaptcha )
	.post( segurity )
	.post( create.post )
	.post( redirect );

app.route('/recover' )
	.all( recover )
	.post( recaptcha )
	.post( recover.beforePost )
	.post( recover.post );

app.route('/change/:base' )
	.all( tester(false) )
	.all( actives('recover') )
	.get( password.get )
	.post( recaptcha )
	.post( password.post );

app.route('/active/:base' )
	.all( actives('active') )
	.get( actives.goTo );

app.all('/logout', tester(true), logout);

module.exports = require('../middleware/render')(app);


/*var connect = function(req, res, next){
	store.block.invite( req.body.email, lib.To.console);
	res.redirect(GLOBAL.CONFIG.servers.www.url);
};*/
