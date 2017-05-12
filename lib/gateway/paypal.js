const status = {
	approved : 1,
	canceled : 2,
	created : 0,
	expired : 2,
	failed : 2, 
	mispaid : 0,
	pending : 0,
};

const payment = {
	"intent": "sale",
	"redirect_urls": {
		"return_url": "",
		"cancel_url": ""
	},
	"payer": {
		"payment_method": "paypal"
	},
	"transactions": []
};

var paypal = require('paypal-rest-sdk');

paypal.configure({
	'mode': 'sandbox', //sandbox or live
	'client_id': GLOBAL.CONFIG.key.paypal.key,
	'client_secret': GLOBAL.CONFIG.key.paypal.secret
});

module.exports.name = 'paypal';
module.exports.tax = 0.054;
module.exports.more = 0.33;
module.exports.icon = 'cc-paypal';

module.exports.get = function (params, callback) {
	var nowPay = _.clone( payment );
	nowPay.redirect_urls.return_url = params.success_url;
	nowPay.redirect_urls.cancel_url = params.cancel_url;

	nowPay.transactions.push({
		'amount': {
			'currency': 'USD',
			'total' : params.total
		},
		'description' : params.descrip
	});
	paypal.payment.create( nowPay, function (err, resp){
		if(err || _.isEmpty(resp))
			return callback(err || new Error('No transacion'));
		callback(err,{
			redirect : true,
			include : false,
			url : _.find( resp.links, function (num) {
				return num.rel === 'approval_url'
			}).href,
			uid : resp.id,
			system : 'paypal'
		});
	});
};

module.exports.get.confirm = function (params, query, callback) {
	paypal.payment.execute( params.uuid, {
		payer_id : query.p
	}, {}, function (err, resp){
		callback(err, _.isObject(resp) && !err ? {
			uuid	: resp.id,
			status	: status[resp.state],
			confirm : resp.payer.payment_method,
			update  : new Date( resp.update_time ),
			system 	: module.exports.name,
			raw 	: resp
		} : null);
	});
};

module.exports.send = true;
