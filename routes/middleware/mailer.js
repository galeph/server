const htmlToText = require('html-to-text');
const juice = require('juice');

var transporter  = require('nodemailer').createTransport(GLOBAL.CONFIG.mail.api ? require('nodemailer-mailgunapi-transport')(GLOBAL.CONFIG.mail) : require('nodemailer-smtp-pool')(GLOBAL.CONFIG.mail));

transporter.on('log', function (log) {
	console.log(log.type + ':', log.message );
});

transporter.use('compile', function (mail, callback) {
	try{
		mail.data.text = htmlToText.fromString(mail.data.html, {
			wordwrap: 80
		});
		callback();
	}catch(e){
		console.log('e:', e);
		callback(e);
	}
});

module.exports = function (req, res, next) {
	res.mail = function (name, obj, callback){
		var rulst = _.extend({
			headers : {
				'X-USER' : req.user ? req.user._id : obj.me._id
			},
			encoding  : 'UTF-8',
			from      : GLOBAL.CONFIG.mail.form,
			replyTo   : GLOBAL.CONFIG.mail.replyTo,
			inReplyTo : GLOBAL.CONFIG.mail.inReplyTo,
			to        : req.user ? req.user.to(obj.toActiveMail) : obj.me.to(obj.toActiveMail),
			name      : name,
			subject   : res.locals.gettext( name + ' subject' )
		}, obj);

		if( !rulst.to )
			return callback( new Error('When yo send email'));

		res.render( path.join(__dirname, '..', 'api', 'mail', rulst.name ), rulst, function (err, doc) {
			if(err || !doc)
				return callback(err || new Error('No body email'));

			rulst.html = juice(doc).replace(/\n|\t/gim, '');

			transporter.sendMail(rulst, callback);
		});
	};

	next();
};

module.exports.transporter = transporter;
