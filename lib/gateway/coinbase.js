const status = {
	'completed' : 1,
	'pending' : 0,
	'create' : 0,
	'cancelled': 2,
	'expired' : 2,
	'mispaid' : 0
};

const payment = {
	'price_currency_iso': 'USD',
	'type': 'buy_now',
	'price_string': 0,
	'custom': '',
	'repeat' : false,
	'subscription': false,
	'success_url': '',
	'cancel_url' : '',
	'description': '',
	'auto_redirect': true,
	'auto_redirect_success': true,
	'auto_redirect_cancel': true,
};

const coinbase = new ( require('coinbase-service') )({
	APIKey: GLOBAL.CONFIG.key.coinbase.key,
	APISecret: GLOBAL.CONFIG.key.coinbase.secret
});

module.exports.name = 'coinbase';
module.exports.tax = 0.0001;
module.exports.more = 0;
module.exports.icon = 'bitcoin';

// Enviar dinero
module.exports.send = true;

// Recibir dinero
module.exports.get = function (params, callback) {
	var nowPay = _.defaults( params, payment );

	nowPay.price_string = params.price;
	nowPay.name = params.title; // TODO MODIFICAR
	nowPay.description = params.descrip;

	coinbase.button({
		button : nowPay
	}, function ( err, resp ){
		callback(err, !_.isEmpty(resp) ? {
			redirect: false,
			include : false,
			iframe 	: true,
			url 	: 'https://www.coinbase.com/checkouts/' + resp.button.code + '/inline',
			uid		: resp.button.code,

			system 	: module.exports.name,
			raw		: resp.button
		} : resp);
	});
};
// Confirmacion
module.exports.get.confirm = function (params, query, callback) {
	coinbase.orders.get( params._id, function (err, resp){
		callback(err, _.isObject(resp) && !err ? {
			uuid	: resp.order.id,
			status	: status[resp.order.status],
			confirm : resp.order.transaction.confirmations,
			system 	: module.exports.name,
			update  : new Date(),
			raw 	: resp
		} : null);
	});
};
