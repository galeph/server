const passport = require('../../middleware/passport');

module.exports = function (req, res, next) {
	passport.authenticate(req.params.sys, function (err, usera, info) {
		if (err)
			return next(err);
		var listParallel = {},
			conect,
			NuevoUsuario;

		if( usera.create ){
			conect = new ( GLOBAL.db.model('external') )( usera );
			listParallel.connect = function (calls) {
				conect.save(function (err, doc) {
					calls(err, doc);
				});
			};

			if(req.user){
				conect.user = req.user._id;

				listParallel.user = function (calls) {
					GLOBAL.db.model('user').findById(req.user._id, function (err, doc) {
						if(err || !doc) return calls(err);
						doc.connect.social[ req.params.sys ] = conect._id;
						doc.save(function (err, doc) {
							calls(err, doc);
						});
					});
				};
			} else {
				req.query.ref = GLOBAL.CONFIG.servers.www.url + 'wellcome';
				NuevoUsuario = new ( GLOBAL.db.model('user') )({
					profile: {
						nick : ( usera.datas.nick.replace(/\s|\-|\_|\./gim, '') + usera.id ).substring(0,14),
						name : usera.datas.nick,
					//	lang : req.session.lang.code
					}
				});
				NuevoUsuario.connect.emails.push({
					mail : usera.datas.email,
					confirm : true
				});
				conect.user = NuevoUsuario._id;
				NuevoUsuario.connect.social[ req.params.sys ] = conect._id;
				listParallel.user = function (calls) {
					NuevoUsuario.setPassword(NuevoUsuario._id.toString());
					NuevoUsuario.connect.emailStar = NuevoUsuario.connect.emails[0]._id;
					NuevoUsuario.save(function (err, doc) {
						calls(err, doc);
					});
				};
			}
			async.series(listParallel, function (err, result) {
				if(err) return next(err);

				if(req.user)
					return next(req.user);

				next(result.user);
			});
		} else {
			if(req.user){
				if( req.user._id.toString() != usera.user._id.toString() )
					return next(new Error('Invalid'));

				next(req.user);
			} else{
				next(usera.user);
			}
		}
	})( req, res, next );
};

module.exports.connect = function (user, req, res, next) {
	if(req.user || util.isError(user))
		return next(util.isError(user) ? user : null );
	req.login( user, function (err) {
		next(err);
	});
};
