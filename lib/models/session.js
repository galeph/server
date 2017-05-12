
module.exports = exports = function (mongo){

	var Mixed	= mongo.Schema.Types.Mixed;

	var Session = new mongo.Schema({
		public  : { type : Boolean, required : true, default : true },
		sid     : { type : String, required : true, unique : true, index : true },
		data	: Mixed,
		expires : { type : Date, index : true },
		lastAccess: { type: Date, index : { expires: parseInt(86400) * 1000 } },
	});

	Session.static('findMe', function (id, callback){
		return this.findOne({
			sid : id,
			//public : true
		}, callback);
	});

	Session.static('all', function (callback) {
		return this.find({}, 'sid expires', callback);
	});

	return mongo.model('session',Session);
};