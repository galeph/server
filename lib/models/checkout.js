const deepPopulate = require('mongoose-deep-populate');
module.exports = exports = function (mongo){
	var ObjectId= mongo.Schema.Types.ObjectId;
	var Mixed	= mongo.Schema.Types.Mixed;

	var checkOutSchema = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		who		: { type : ObjectId, ref: 'user', required : true },
		status	: { type : Number, required : true, Min : 0, Max : 3, default : 0 },
		baucher	: [ { type : ObjectId, ref: 'baucher', required : true, unique : true } ],
		method	: { type : String, lowercase : true },
		uuid	: { type : String, trim : true },
		data	: { type : Mixed, required : true },
		dateCr	: { type : Date, required : true, default : Date.now() },
		dateLa	: { type : Date, required : true, default : Date.now() },
		total	: { type : Number, required : true, Max : 10000, Min : 0 }
	});

	checkOutSchema.virtual('success_url').get(function () {
		return GLOBAL.CONFIG.servers.shop.url + 'sell/' + this._id.toString();
	});

	checkOutSchema.virtual('success_path').get(function () {
		return 'sell/' + this._id.toString();
	});

	checkOutSchema.virtual('color').get(function () {
		var color;
		if( this.status == 1 )
			color = 'green'; // pagado
		if( this.status == 2 )
			color = 'red'; // Error
		return color || 'orange'; // Esperando
	});

	checkOutSchema.virtual('methodExec').get(function () {
		return lib.gateway().payment( this.method, 'send' );
	});

	checkOutSchema.virtual('price').get(function () {
		return this.total - ( ( this.methodExec.tax * this.total ) + this.methodExec.more );
	});

	checkOutSchema.virtual('custom').get(function () {
		return this._id.toString();
	});

	checkOutSchema.virtual('dateSend').get(function () {
		return moment(this.dateCr)
				.add(GLOBAL.CONFIG.basic['send money'].time, GLOBAL.CONFIG.basic['send money'].type)
				.toDate();
	});

	checkOutSchema.pre('remove', function (next) {
		if(this.status > 0 )
			return next(new Error('Not remove'));
		next();
	});

	checkOutSchema.static('findByIdAndUser', function (id, user, callback){
		return this.findOne({
			_id : id,
			who	: user,
			public : true
		}, callback);
	});

	checkOutSchema.set('toJSON', {
		virtuals : true
	});
	checkOutSchema.plugin(deepPopulate);
	checkOutSchema.path('method').validate( GLOBAL.lib.testPaysys,'Pay System');

	return mongo.model('checkout', checkOutSchema);
};
