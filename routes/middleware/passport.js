const masterUrl = lib.urlServer('auth').url;
const passport= require('passport');
const Local	= require('passport-local').Strategy;
const Fb	= require('passport-facebook').Strategy;
const Goo	= require('passport-google-oauth').OAuth2Strategy;
const Yahoo	= require('passport-yahoo-oauth').Strategy;
const SCloud= require('passport-soundcloud').Strategy;

//const PyPl	= require('passport-paypal-oauth').Strategy;
//const Twit	= require('passport-twitter').Strategy;
//const Tumblr= require('passport-tumblr').Strategy;

/**
 * Contructor de metodos externos para Login
 * @param  {String}   token   Token de la app
 * @param  {string}   secret  Screto para entrar app
 * @param  {Object}   profile Perfil del usuario
 * @param  {Function} done    Funcion de ejecucion final
 */
function make (token, secret, profile, done){
	try{
		GLOBAL.db.model('external').findOne({
			public : true,
			uuid   : profile.id,
			provid : profile.provider,
		}).populate('user').exec(function (err, doc) {
			if(err) return done(err);
			if(_.isEmpty(doc)){
				var pro = _.clone(profile);
				pro.create = true;
				pro.uuid = profile.id;
				pro.provid = profile.provider;
				pro.token  = token;
				if(secret)
					pro.secret = secret;
				pro.datas  = {
					url		: profile.url || profile._json.url,
					image	: profile.photos || profile.images,
					nick	: ( profile.username || profile.displayName ).replace(/\.|\-|\s|\_/gim, ''),
					email   : profile.emails
				};
				if(_.isArray(pro.datas.image))
					pro.datas.image = _.isObject(pro.datas.image[0]) ?  pro.datas.image[0].value : pro.datas.image[0];
				if(_.isArray(pro.datas.email))
					pro.datas.email = _.isObject(pro.datas.email[0]) ? pro.datas.email[0].value: pro.datas.email[0];

				done(null, pro);
			} else{
				doc.token = token;
				if(secret)
					doc.secret = secret;
				doc.save(function (err, doc) {
					done(err, doc);
				});
			}
		});
	}catch(e){
		done(e);
	}
}

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	GLOBAL.db.model('user').findById( id, function (err, doc) {
		done(err, doc);
	});
});

passport.use(new Local(function (username, password, done) {
	GLOBAL.db.model('user').findByUser(username).exec('findOne', function (err, doc){
		if(err || _.isEmpty(doc))
			return done(err, false );

		if( !doc.isValidPassword( password ) )
			return done(err, false, {
				message : 'err_login'
			});

		done(err, doc);
	});
}));

/* Google */
passport.use(new Goo({
	clientID     : GLOBAL.CONFIG.key.google.key,
	clientSecret : GLOBAL.CONFIG.key.google.secret,
	callbackURL  : masterUrl + 'callback/google'
}, make ) );

/* Yahoo */
passport.use(new Yahoo({
	consumerKey    : GLOBAL.CONFIG.key.yahoo.key,
	consumerSecret : GLOBAL.CONFIG.key.yahoo.secret,
	callbackURL    : masterUrl + 'callback/yahoo'
}, make ));

/* Facebook */
passport.use(new Fb({
	clientID      : GLOBAL.CONFIG.key.facebook.key,
	clientSecret  : GLOBAL.CONFIG.key.facebook.secret,
	profileFields : ['id', 'displayName', 'photos', 'email', 'public_profile', 'user_website', 'publish_actions'],
	callbackURL   : masterUrl + 'callback/facebook'
}, make ));

/* SoundCloud */
passport.use(new SCloud({
	clientID     : GLOBAL.CONFIG.key.soundcloud.key,
	clientSecret : GLOBAL.CONFIG.key.soundcloud.secret,
	callbackURL	 : masterUrl + 'callback/soundcloud'
}, make ));

/* Descartados

/* Paypal 
passport.use(new PyPl({
	sandbox      : true,
	clientID     : GLOBAL.CONFIG.key.paypal.key,
	clientSecret : GLOBAL.CONFIG.key.paypal.secret,
	callbackURL  : masterUrl + 'callback/paypal'
}, make ) );

/* Twitter 
passport.use(new Twit({
	consumerKey    : GLOBAL.CONFIG.key.twitter.key,
	consumerSecret : GLOBAL.CONFIG.key.twitter.secret,
	callbackURL    : masterUrl + 'callback/twitter'
}, make ) );

/* Tumblr 
passport.use(new Tumblr({
	consumerKey    : GLOBAL.CONFIG.key.tumblr.key,
	consumerSecret : GLOBAL.CONFIG.key.tumblr.secret,
	callbackURL    : masterUrl + 'callback/tumblr'
}, make ) );

*/

module.exports = passport;
