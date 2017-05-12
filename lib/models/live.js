
module.exports = exports = function (mongo){

	var live = new mongo.Schema({
		public  : { type : Boolean, required : true, default : true },
		cuando  : { type : Date, index : true, required : true },
		banda   : { type : String, required : true, index : true, trim : true },
		donde   : { type : String, required : true, index : true, trim : true },
	});

	live.pre('validate', function(next){
		if(_.isDate(this.cuando)){
			return next();
		}

		this.cuando = GLOBAL.moment(this.cuando);
		next();
	});

	return mongo.model('live',live);
};