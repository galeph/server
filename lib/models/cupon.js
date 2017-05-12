module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;

	var cupons = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		dateLa	: { type : Date, required : true, default : Date.now() },
		active	: { type : Boolean, required : true, default : false },
		used	: { type : Boolean, required : true, default : false },
		shoppe  : { type : ObjectId, ref: 'user', required : true }, // Comprador
		util    : { type : ObjectId, ref: 'invoice' }, // Comprador
		count   : { type : Number, required : true, Min: 0 }, // Valor
		type    : { type : Number, required : true, Min: 0, Max : 3 }, // Valor
	});

	return cupons;
};