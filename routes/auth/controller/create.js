module.exports.get = function( req, res, next ) {
	req.page.push('create');
	res.locals.css.push( 'create' );
	res.locals.css.push( 'auth' );
	next({
		email : Array.isArray(req.params.uis ) ? req.params.uis[1] : '',
		nicks : '',
		names : '',
		invitation : Array.isArray(req.params.uis ),
		title : res.locals.create_auth
	});
};

module.exports.post = function(req, res, next){
	if(!req.query.ref)
		req.query.ref = GLOBAL.CONFIG.servers.www.url + 'wellcome';

	res.locals.css.push( 'create');
	res.locals.css.push( 'error' );
	req.page.push( 'create');
	res.locals.css.push('login');
	if( res.locals.sessionID != req.body.sec && !req.body.nick && !req.body.email && !req.body.pass)
		return next(req.body);

	var NuevoUsuario = new ( GLOBAL.db.model('user') )({
		profile: {
			nick : req.body.nick,
			name : req.body.names,
		}
	});
	NuevoUsuario.setPassword(req.body.repass);
	NuevoUsuario.connect.emails.push({
		mail : req.body.email
	});

	NuevoUsuario.connect.emailStar = NuevoUsuario.connect.emails[0]._id;
	
	async.waterfall([
		function (callback) {
			NuevoUsuario.save(function (err, user) {
				callback(err, user);
			});
		},
		function (user, callback) {
			req.login( user, function (err) {
				callback(err, user);
			});
		},
		function (doc, callback) {
			res.mail('wellcome', {
				me : doc
			}, callback );
		}
	], function (err, b) {
		console.log(err);
		if(err) return next(req.body);
		req.flash('basic', 'check_email');
		next();
	});
};

module.exports.mail = function (req, res, next) {
	res.mail('active', {
		toActiveMail : req.params.id
	}, function (err) {
		res.json({
			id : req.params.id,
			is : true,
			error : err
		})
	});
};
