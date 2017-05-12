/**
 *	Status		Sig
 *		0 -> Espera
 *		1 -> Pagando
 *		2 -> Pago relaizado
 */
const deepPopulate = require('mongoose-deep-populate');
module.exports = exports = function (mongo){

	var ObjectId = mongo.Schema.Types.ObjectId;

	var checkInSchema = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		who		: { type : ObjectId, ref: 'user', required : true },
		status	: { type : Number, required : true, Min : 0, Max : 3, default : 0 },
		baucher	: [ { type : ObjectId, ref: 'baucher', required : true, unique : true } ],
		method	: { type : String, lowercase : true },
		uuid	: { type : String, trim : true, unique : true },
		dateCr	: { type : Date, required : true, default : Date.now() },
		dateLa	: { type : Date, required : true, default : Date.now() },
		total	: { type : Number, required : true, Max : 1000, Min : 0 }
	});

	checkInSchema.static('findByIdAndUser', function (id, User){
		var is = GLOBAL._.isObject(User) ? User._id : User;
		return this.findById( id )
			.where('public').equals( true )
			.where('who').equals( is );
	});

	checkInSchema.virtual('redirect').get(function () {
		return this.method === 'paypal' ;
	});

	checkInSchema.virtual('color').get(function () {
		var color;
		if( this.status == 1 )
			color = 'green'; // pagado
		if( this.status == 2 )
			color = 'red'; // Error
		return color || 'orange'; // Esperando
	});

	checkInSchema.virtual('cancel_url').get(function () {
		return GLOBAL.CONFIG.servers.shop.url + 'pay/cancel/' + this._id.toString();
	});

	checkInSchema.virtual('success_url').get(function () {
		return GLOBAL.CONFIG.servers.shop.url + 'pay/' + this._id.toString();
	});

	checkInSchema.virtual('methodExec').get(function () {
		return lib.gateway().payment( this.method, 'get' );
	});

	checkInSchema.virtual('price').get(function () {
		return this.total + ( this.methodExec.tax * this.total ) + this.methodExec.more;
	});

	checkInSchema.virtual('custom').get(function () {
		return this._id.toString();
	});

	checkInSchema.pre('remove', function (next) {
		if(this.status > 0 )
			return next(new Error('Not remove'));
		next();
	});

	checkInSchema.method({
		createPayment : function (data, cb) {
			var self = this;
			if(!self.methodExec)
				return cb(new Error('Not exist method'));
			var param = _.clone(self.toJSON());

			_.extend(param, data);
			self.methodExec.get(param, function (err, data) {
				if(err) return cb(err);
				self.uuid = data.uid;
				cb(err, data);
			});
		},
		confrimPayment : function (query, cb) {
			var self = this;
			if(!self.methodExec)
				return cb(new Error('Not exist method'));
			var param = _.clone(self.toJSON());

			self.methodExec.get.confirm(param, query, cb);
		}
	});

	checkInSchema.set('toJSON', {
		virtuals : true
	});
	checkInSchema.plugin(deepPopulate);

	checkInSchema.path('method').validate( GLOBAL.lib.testPaysys,'Pay System');
	return mongo.model('checkin', checkInSchema);
};
