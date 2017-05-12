
module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;

	var	album = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		name	: { type : String, trim : true, index : true },
		slug	: { type : String, trim : true, unique: false },
		user	: { type : ObjectId, ref: 'user', required : true },
		date	: { type : Date, default : Date.now, required : true },
		top		: { type : ObjectId, ref: 'img', required : true }
	});

	album.static('findByUser', function (doc, callback) {
		return this.find({
			'user' : doc,
			public : true
		}, callback );
	});

	album.static('findOrCreate', function (alb, callback) {
		var imgs = GLOBAL._.clone(alb);
		delete alb.portada;
		alb.public = true;
		var sleft = this;
		sleft.findOne(alb, function (err, doc) {
			if(err) return callback(err);
			if( GLOBAL._.isEmpty(doc) )
				var doc = new sleft(imgs);
			doc.save(callback);
		});
	});

	album.static('findAll', function (user, callback) {
		var id =_.isObject(user) ? user._id : user;
		return this.findByUser( id ).populate('top');
	});


	album.static('findBySulgAndUser', function (sulg, user ){
		return this.findOne({
			public : true,
			slug : sulg,
			user : _.isObject(user) ? user._id.toString() : user.toString()
		}).populate('top');
	});

	album.static('search', function (z, query){
		var query = [ { 'name' : z },
				{ 'slug' : z },
				{ 'name' : { $regex: z, $options: 'gim' } },
				{ 'slug' : { $regex: z, $options: 'gim' } } ];
		return this
			.find( { public : true } )
			.or( query )
			.populate('user')
			.populate('top');
	});

	album.pre('save', function (next) {
		if (this.get('slug') === undefined ){
			var name = this.get('name') + ' ' + ( new Date(this.get('date') ) ).getMinutes();
			this.set('slug', _.slugify( name ).substring(0, GLOBAL.CONFIG.basic.text.nick.max ) );
		}
		next();
	});

	album.virtual('topURI').get(function () {
		return '/' + this._id + '.album';
	});

	album.path('name').validate( GLOBAL.lib.maxCaracteres( GLOBAL.CONFIG.basic.text.name ), 'format');
	album.path('name').validate( lib.testName, 'format');

	return mongo.model('albums', album);
};
