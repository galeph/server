const request = require('request');
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const regEmail = /(\"|\'|\s|<)?[a-z|0-9]{1}[a-z|0-9|.|_|-]{1,32}@[a-z|0-9|-]{1,15}(.(ac|ad|ae(ro)?|af|ag|ai|al|am|an|ao|aq|ar|as(ia)?|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi(z)?|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca(t)?|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co(m|op)?|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|edu|ee|eg|eh|er|es|et|eu(s)?|fi|fj|fk|fm|fo|fr|ga(l)?|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in(fo|t)?|io|iq|ir|is|it|je|jm|jo(bs)?|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo(bi)?|mp|mq|mr|ms|mt|mu(seum)?|mv|mw|mx|my|mz|na(me)?|nc|ne(t)?|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pr(o)?|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr(avel)?|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|yu|za|zm|zw)){1,2}(\"|\'|\s|>)?/gim;

function cleanList (next) {
	return function (error, response, html){
		if(error) return next(error);
		var list = ( html + '' ).match(regEmail) || [];
		next(_.compact(list));
	}
}

module.exports = function (req, res, next) {
	req.session.selectFriend = [];
	GLOBAL.db.model('connect').findConnect(req.params.provi, req.user, function (err, doc) {
		if(err || _.isEmpty(doc))
			return next(err || new Error('Is not a user'));

		req.session.selectFriend = [];
		next(doc);
	});
};

module.exports.google = function (doc, req, res, next) {
	if( util.isError(doc) )
		return next(doc);

	request({
		url: 'https://www.google.com/m8/feeds/contacts/default/full',
		headers: {
			'GData-Version': '3.0',
			'Authorization': 'AuthSub token=' + doc.token
		},
		qs : {
			alt : 'json',
			v : '3.0',
			'access_token' : doc.token
		}
	}, cleanList(next));
};
module.exports.outlook = function (doc, req, res, next) {
	if( util.isError(doc) )
		return next(doc);
};

module.exports.yahoo = function (doc, req, res, next) {
	if( util.isError(doc) )
		return next(doc);

	request({
		url: 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&v=3.0&access_token=' + doc.token,
		oauth : {
			consumer_key: GLOBAL.CONFIG.key.yahoo.key,
			consumer_secret: GLOBAL.CONFIG.key.yahoo.secret
		},
		qs : {
			format : 'json',
			Authorization : 'OAuth',
			realm : 'yahooapis.com',
			'oauth_token' : doc.token,
			q : 'select * from social.profile where guid=me'
		}
	}, cleanList(next));
};

module.exports.update = function (list, req, res, next) {
	if( util.isError(list) )
		return next(list);

	var NON_USER = [];
	var userS = GLOBAL.db.model('user');
	req.params.template = 'import-contact';

	GLOBAL.async.map(list, function (mail, other) {
		var mailClean = mail.replace(/\"|\'|\s|<|>/gim, '');
		userS.findOne({
			public : true,
			'connect.emails.mail' : mailClean,
		}, function (err, docs) {
			if(err)
				return other(err);
			if(docs)
				return other(null, docs._id);
			NON_USER.push(mailClean);
			other(err);
		});
	}, function (err, users){
		if(err)
			return next(err);
		request({
			method: 'POST',
			url: GLOBAL.CONFIG.key.mailing,
			form: {
				mail : NON_USER.join(',')
			}
		},function (err) {
			req.session.selectFriend = users;
			next(err);
		});
	});
};

/**
 * Render de los contactos importados
 * @param  {Object} data objecto master
 */
module.exports.render = function (data) {
	var socket = this;
	socket.client.request.session.selectFriend = socket.client.request.session.selectFriend || [];
	var query = {  $or : [] };

	for (var i = socket.client.request.session.selectFriend.length - 1; i >= 0; i--)
		query.$or.push({ _id : socket.client.request.session.selectFriend[i], public : true });

	if(!query.$or.length){
		delete query.$or;
		query.certi = true;
	}

	GLOBAL.db.model('user').find(query)
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.exec(function (err, doc) {
		if(err) socket.emit('error', err);
		
		socket.emit('view',  doc.reverse() );
	});
};
