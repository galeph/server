module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;
	var Url		= mongo.SchemaTypes.Url;
	var connectSc = new mongo.Schema({
		public : { type : Boolean, required : true, default : true },
		active : { type : Boolean, required : true, default : true },
		provid : { type : String, required : true, trim: true, lowercase : true },
		user   : { type : ObjectId, ref: 'user', index : true, required : true },
		uuid   : { type : String, required : true, unique : true, trim : true, index : true },
		token  : { type : String, required : true, unique : true, trim : true, index : true },
		secret : { type : String, trim : true, index : true },
		datas  : {
			url   : Url, // Url del nick Si tiene
			image : Url, // Url de la imagen Si tiene
			nick  : { type : String, required : true, trim: true } // Nickname del usuario
		}
	});

	connectSc.static('add', function (user, profile, callback){
		this.findOneAndUpdate({
			public : true,
			uuid   : profile.id,
			provid : profile.provider,
			user   : user._id
		},{
			token  : token,
			secret : secret,
			datas   : {
				url		: 'http://' + profile.provider + '.com/' + profile.username,
				image	: profile.photos[0].value,
				nick	: profile.username }
		},{
			upsert : true
		}, callback);
	});

	connectSc.static('findConnect', function (external, user, callback){
		return this.findOne({
			public : true,
			provid : external,
			user   : user.profile ? user._id : user
		}, callback);
	});

	connectSc.path('provid').validate(lib.testNetwork, 'network');

	return mongo.model('external', connectSc);
};
