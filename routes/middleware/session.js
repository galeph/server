const util = require( process.binding('natives').util ? 'util' : 'sys');
var Session = require('express-session');
/**
 * Contructor de sessiones
 * @param  {object} options objecto de opciones para la Store
 */
var session = function(options) {
	options = options || {};
	Session.Store.call(this, options);
};

util.inherits(session,  Session.Store);
/**
 * Colocar session en la base de datos
 * @param {String}   sid  ID de la session
 * @param {Object}   data Informacion a guardar
 * @param {Function} fn   ejecucion despues de guardar
 */
session.prototype.set = function (sid, data, fn) {
	delete data.isd;
	GLOBAL.db.model('session').findMe(sid, function (err, doc){
		if(err) return fn(err);
		if(_.isEmpty(doc) ) {
			var doc = new ( GLOBAL.db.model('session') )({
				sid : sid
			});
		}

		doc.lastAccess = _.isEmpty( data.lastAccess ) ? new Date() : new Date(data.lastAccess);
		doc.expires = moment( doc.lastAccess ).add(3, 'months').toDate();

		doc.data = _.clone(data);

		doc.save(function (err) {
			data.isd = doc._id.toString();
			fn(err, data);
		});
	});
};
/**
 * Obtencion de session
 * @param  {string}   sid ID en la Cookie
 * @param  {Function} fn  [funcion de ejecion
 * @return {Object}       Objecto de informacin
 */
session.prototype.get = function(sid, fn) {
	var data = null;
	GLOBAL.db.model('session').findMe(sid, function (err, session){
		if( err || _.isEmpty(session) )
			return fn(err, data);
		data = _.clone(session.data);
		data.isd = session._id.toString();
		fn(null, data );
	});
};
/**
 * Destructor de sessiones
 * @param  {string}   sid ID en la Cookie
 * @param  {Function} fn  [funcion de ejecion
 * @return {Object}       Objecto de informacin
 */
session.prototype.destroy = function(sid, fn) {
	GLOBAL.db.model('session').remove({
		sid: sid
	}, fn);
};
/**
 * Contador de sessiones
 * @param  {Function} fn  [funcion de ejecion
 */
session.prototype.length = function(fn) {
	GLOBAL.db.model('session').count({}, fn);
};

session.prototype.all = function(fn) {
	GLOBAL.db.model('session').drop(fn);
};

session.prototype.clear = function(fn) {
	GLOBAL.db.model('session').count({}, fn);
};

module.exports = Session({ //Sessiones
	secret  : GLOBAL.CONFIG.response.sessions.word,
	key	 : GLOBAL.CONFIG.response.sessions.cookie,
	rolling : true,
	saveUninitialized : true,
	resave : true,
	store   : new session(),
	cookie  : {
		// TODO
		//secure: false
		domain : GLOBAL.CONFIG.response.sessions.domain
		//httpOnly : true,
		//path : "*"
	}
});
