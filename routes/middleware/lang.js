const util = require( process.binding('natives').util ? 'util' : 'sys');
var exLang = require('express-lang');
/**
 * Contrucctor de Idoma
 * @param  {Object} options Opciones
 */
var translate = function(options) {
	options = options || {};
	exLang.Store.call(this, options);
};

util.inherits(translate,  exLang.Store);
/**
 * Selecionador de Lenguaje
 * @param  [String]   langs Una Array de Strings, segun idoma.
 * @param  {Function} fn    Funcion de retorno
 * @param  {Object}   req   Objecto de Peticion
 */
translate.prototype.getLang = function (langs, fn, req) {
	var list = [];
	for (var i = 0; i < langs.length; i++) {
		list.push({
			code : _.isObject(langs[i]) ? langs[i]._id : langs[i],
			public : true
		});
	}

	GLOBAL.db.model('lang').findOne({
		$or : list
	}).populate('extend').exec(function (err, doc) {
		if(err || !doc)
			return fn(err, {}, null);
		var keys = doc.words;
		for (var i = doc.extend.length - 1; i >= 0; i--)
			keys = _.defaults(keys, doc.extend[i].words );

		fn(err, keys, _.omit(doc.toJSON(), 'extend', 'words' ));
	});
};

/**
 * Obtener lista de idioma
 * @param  {Function} fn Funcion de etorno
 */
translate.prototype.listLang = function(fn) {
	GLOBAL.db.model('lang').find({
		public : true
	})
		.select('-words')
		.select('-extend')
		.exec(fn);
};

module.exports = exLang({
	lang : GLOBAL.CONFIG.response.lang,
	store : new translate(),
	query : 'lang',
	localte : 'gettext'
});