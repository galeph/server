
module.exports = exports = function (mongo){
	
	const Email	   = mongo.SchemaTypes.Email;

	var suscribe = new mongo.Schema({
		public  : { type : Boolean, required : true, default : true },
		mail    : { type : Email, required : true, unique : true, trim : true, index : true },
		geo     : [{ type : Number, index: '2dsphere' }],
		search	: { type : String, trim : true },
		date	: { type : Date, default : Date.now, required : true }
	});

	return mongo.model('suscribe',suscribe);
};