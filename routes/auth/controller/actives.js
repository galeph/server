const thatsRun ={
	active : function (doc, param, calls) {
		for (var i = doc.connect.emails.length - 1; i >= 0; i--) {
			if( doc.connect.emails[i].mail.toLowerCase() === param[2].toLowerCase() ){
				doc.connect.emails[i].confirm = true;
				doc.connect.notic.mail = new Date();
			}
		}

		doc.save(function (err, doc) {
			calls(err || doc);
		});
	},
	recover : function (doc, param, calls) {
		var now = moment();
		var when = moment(param[1]).add(GLOBAL.CONFIG.basic.recover.time, GLOBAL.CONFIG.basic.recover.type);
		var fail = when.diff(now) > 0 ? null : new Error('Sabot') ;
		calls(fail || doc);
	}
};

module.exports = function (name){

	return function (req, res, next) {
		GLOBAL.db.model('user').findById(req.params.base[0], function (err, doc) {
			if(err || !doc) 
				return next(err || new Error('Not exist user'));
			thatsRun[name](doc, req.params.base, next);
		});
	};
};

module.exports.goTo = function (doc, req, res, next) {
	if(util.isError(doc))
		return next(doc);

	res.flash('info', 'active mail');
	res.redirect( GLOBAL.CONFIG.servers.www.url );
};