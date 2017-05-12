const cookieParser = require('cookie-parser');
const cookie  = require('cookie');

/**
 * Obtener session del Socket
 * @param  {Object} data   Objecto de req
 * @param  {Function} accept Fucnion de aceptacion
 */
module.exports = function(data, accept){

	var sessionID;

	if( _.isString(data.headers.cookie) && data.headers.cookie.length > 2 ){
		data.cookies = cookie.parse( data.headers.cookie );

		if(_.isEmpty(data.cookies) )
			return accept(new Error('No cookies'), false);

		data.signedCookies = cookieParser.signedCookies(data.cookies, GLOBAL.CONFIG.response.sessions.word );
		sessionID = data.signedCookies[ GLOBAL.CONFIG.response.sessions.cookie ];
	} else if(data._query.ses && data._query.ses.length > 2 ){
		sessionID = cookieParser.signedCookie(data._query, GLOBAL.CONFIG.response.sessions.word);
	}

	if( _.isEmpty(sessionID) )
		return accept(new Error('Session ID no exist'), false);

	GLOBAL.db.model('session').findMe( sessionID, function (err, session){
		if( err || _.isEmpty(session) )
			return accept(err ||  new Error('Session Empty'), false);

		data.login = false;
		data.session = session.data;
		data.sessionID = sessionID;
		if( _.isEmpty( data.session.passport ) || _.isEmpty( data.session.passport.user ) )
			return accept(err, _.isObject(data.session) );

		GLOBAL.db.model('user').findById( data.session.passport.user, function (err, doc){
			if(err) return accept(err, false);
			data.login = true;
			data.user = doc;
			accept(err, _.isObject(session) && _.isObject(doc) );
		});
	});
};