//Tags

module.exports = exports = function (mongo){

	var tag = new mongo.Schema({
		public: { type : Boolean, required : true, default : true },
		name : { type : String, trim : true, required : true, unique : true },
		nume : { type : Number, min: 0, required : true, default : 0 },
		fech : { type : Date, default : Date.now }
	});

	tag.static('insert', function (tax, callback) {
		this.findOneAndUpdate({
			name : { $regex: tax, $options: 'i' }
		}, {
			name : tax ,
			$inc : { nume : 1 }
		}, {
			upsert : true
		}, callback );
	});

	tag.static('findTag', function (z, cb){
		this.find( { 'name' : { $regex : z, $options: 'gim' } }, cb );
	});

	return tag;
};
