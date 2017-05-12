module.exports = exports = function (mongo){

	var ObjectId = mongo.Schema.Types.ObjectId;

	var baucherSchema = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		checkIn	: { type : ObjectId, ref: 'checkin' }, // Si existe ya ha  sido pagado
		checkOut: { type : ObjectId, ref: 'checkout' }, // Si existe ya ha sido enviado
		item	: { type : ObjectId, ref: 'item', required : true },
		price	: { type : Number, required : true, Min : 0 },
		shop	: { type : ObjectId, ref: 'user', required : true },
		seller	: { type : ObjectId, ref: 'user', required : true },
		dates	: { type : Date, index : true, required : true, default : Date.now }
	});

	baucherSchema.static('findItemAndUser', function (id, user, callback){
		if(!user) return callback(null, null);
		return this.findOne({
			item   : id,
			shop   : user,
			checkIn: { $exists: true }
		}, callback);
	});

	baucherSchema.static('isBayCount', function (id, callback){
		return this.count({
			item   : id,
			checkIn: { $exists: true }
		}, callback);
	});

	baucherSchema.static('findByIdsAndSeller', function (arr, user, callback){
		//TODO Modificar este Query
		var query = { public : true, $or : [], checkOut: { $exists: false }  };
		for (var i = arr.length - 1; i >= 0; i--)
			query.$or.push({ _id : mongo.Types.ObjectId( arr[i]), seller : user._id });
		
		return this.find(query, callback);
	});

	baucherSchema.static('findByUserAndCheckin', function (user, id, callback){
		return this.find({
			shop	: user,
			public	: true,
			checkIn : id
		}, callback);
	});

	baucherSchema.static('findBySeller', function (qu, ins, outs){
		qu.checkOut = _.isString(outs) ? mongo.Types.ObjectId(outs) : outs;
		if(ins) qu.checkIn = ins;
		return this.aggregate()
				.match(qu)
				.group({
						_id: '$_id',
						item : {
							$last : '$item'
						},
						table: {
							$push :  {
								item : '$price',
								baucher : '$_id'
							}
						}
					});
	});

	baucherSchema.static('findAndCompact', function (qu){
		return this.aggregate()
				.match(qu)
				.group({
						_id: '$_id',
						item : {
							$last : '$item'
						}
					});
	});

	baucherSchema.static('findByUserAndCheckout', function (user, id, callback){
		return this.find({
			seller	: user,
			public	: true,
			checkOut : id
		}, callback);
	});

	baucherSchema.pre('remove', function (next) {
		if(this.checkIn )
			return next(new Error('Not remove'));
		next();
	});

	baucherSchema.path('price').validate( function (v) {
		return v > 0;
	},'format');

	baucherSchema.path('shop').validate( function (v) {
		return v.toString() != this.seller.toString();
	},'format');

	return mongo.model('baucher', baucherSchema);
};
