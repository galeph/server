//Imagenes Videos y Musica
const ROOTFILES = 'glph';
const jsonSelect = require('mongoose-json-select');
const NoMongo= require('mongodb-uri');
const exif = require('exiftool');

if(GLOBAL.CONFIG.response.compress.html)
	exif.command('./vendor/exiftool-9.40/bin/exiftool');

module.exports = exports = function (mongo){

	const ObjectId  = mongo.Schema.Types.ObjectId;
	const GridStore = mongo.mongo.GridStore;

	var itemSh = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		date	: { type : Date, default : Date.now, required : true },
		dateLa	: { type : Date, default : Date.now }, //Minimo //Ultima modificaciones
		descri	: { type : String, trim : true }, // Descripcion
		creator	: { type : ObjectId, ref: 'user', required : true },  // Creador
		dateCr	: { type : Date, default : Date.now, required : true }, // Creacion
		sell	: {
			is		: { type : Boolean, required : true, default : false },
			deals	: { type : Boolean, required : true, default : false },
			digital	: { type : Boolean, required : true, default : true },
			stock	: { type : Number, Min : 0,  default : 0 }, // 0 es infinito!
			price	: { type : Number, Min :GLOBAL.CONFIG.basic.shop.min, Max : GLOBAL.CONFIG.basic.shop.max, default : 1 },
		},
		licens	: {  // Licencia
			comere	: { type : Boolean, required : true, default : false }, // No-Comercio
			shares	: { type : Number, Min : 0,  Max : 2, required : true, default : 0 } //RECONOCMIENTO
		},
		album	: [ { type : ObjectId, ref: 'albums', index : true } ],
		file 	: {
			id          : { type : ObjectId, ref: ROOTFILES +'.files', index : true },
			contentType : { type : String, required : true, trim : true, index : true }
		}
	});

	itemSh.static('findTimeLine', function (user, follow, q ){
		var query = GLOBAL._.isObject(q) ? q : {};
		query.public = true;
		query.$or = [ { creator : user._id } ];
		query.$nor = [ { public : false } ];

		for (var i = follow.length - 1; i >= 0; i--){
			if(follow[i].date){
				query.$or.push({ 'creator' : follow[i].how });
			}else{
				if(follow[i].form )
					query.$nor.push({ 'creator' : follow[i].how });
				if(follow[i]._id && !follow[i].form )
					query.$or.push({ 'creator' : follow[i]._id });
			}
		}

		if(!query.$or.length)
			delete query.$or;

		return this.find(query)
				.sort({ 'dateLa':  'desc' })
				.populate( 'creator' );
	});

	itemSh.static('findByUser', function (User, callback){
		var id = GLOBAL._.isObject(User) ? User._id : User;
		return this.find({
			public : true,
			creator : id
		}, callback);
	});

	itemSh.static('CountByUser', function (user, callback){
		var YES = [ { public : true }, { 'creator' : user._id } ],
			NOT = [ { public : false } ];
		for (var i = user.social.none.users.length - 1; i >= 0; i--)
			NOT.push( { 'creator' : user.social.none.users.length[i] } );

		return this.find()
			.or( YES )
			.nor( NOT ) //Busca la lista
			.where( 'dateLa' ) //Desde que fachas
				.gte( new Date( user.connect.noti ) )
				.lte( new Date(15000000,0,0,0,0,0) )
			.count(callback);
	});

	itemSh.static('findByAlbums', function (id, user, callback){
		return this.find({
			public : true,
			'album': id,
			'creato' : user
		}, callback);
	});

	itemSh.static('CountByAlbums', function (id, callback){
		this.count({ 'album' : id, public : true }, callback );
	});

	itemSh.static('findItem', function (ID, callback) {
		return this.findById( ID )
			.where('public').equals( true )
			.populate('creator')
			.populate('tags')
			.populate('album')
			.exec( callback );
	});

	itemSh.static('findItemAndUser', function (ID, user) {
		return this.findById( ID )
			.where('public').equals( true )
			.where('creator').equals( user );
	});

	itemSh.static('findTag', function (etiqueta) {
		this.find()
			.where('public').equals( true )
			.where('creator').equals( UserID )
			.where('categ').in( etiqueta )
			.where('dateLa').gte( new Date(0,0,0,0,0,0) ).lte( end )
			.sort('dateLa', -1)
			.skip( PagN * nxPage )
			.limit( nxPage );
	});

	itemSh.static('findPrevNext', function ( image, next ){
		var iteM = this;
		GLOBAL.async.parallel({
			next : function (callback) {
				iteM.findOne({
					public : true,
					creator : image.creator || image.creator._id,
					date : {
						$gt: image.date
					}
				}).sort('date').exec(callback);
			},
			prev : function (callback) {
				iteM.findOne({
					public : true,
					creator : image.creator || image.creator._id,
					date : {
						$lt: image.date
					}
				}).sort('-date').exec(callback);
			}
		}, next);
	});

	itemSh.static('notify', function (ObjtID){
		var YES = [{
			public :  true, 'creator' : ObjtID._id
		}];

		var NOT = [ { public :  false }];
		for (var i = ObjtID.social.nones.users.length - 1; i >= 0; i--)
			NOT.push({ 'creator' : ObjtID.social.nones.users[i] } );

		for (var i = ObjtID.social.nones.images.length - 1; i >= 0; i--)
			NOT.push({ '_id' : ObjtID.social.nones.images[i] });

		return this.find({
			$or : YES,
			$nor : NOT
		}).watch('social.dateLa', ObjtID.connect.notic.noti );
	});

	itemSh.static('findForCart', function (items, user ){
		var query = {
			public : true,
			'sell.is' : true,
			$or : [ { _id : '000000000000000000000000' } ],
			creator : {
				$ne : user
			}
		};
		for (var i = items.length - 1; i >= 0; i--)
			query.$or.push({ _id : items[i] });

		return this.find(query).populate('creator');
	});

	itemSh.static('findWellcome', function (isThis, who) {
		var query = {
			$or : [],
			public : true,
			'file.contentType' : {
				$regex: isThis,
				$options: 'gim'
			}
		};

		for (var i = who.length - 1; i >= 0; i--)
			if( who[i].creti )
				query.$or.push({ 'creator' : who[i]._id });

		if( !query.$or.length )
			delete query.$or;

		return this.find(query).populate( 'creator' );
	});

	itemSh.virtual('isImage').get(function () {
		return /image/gi.test(this.file.contentType) ;
	});

	itemSh.virtual('isVideo').get(function () {
		return /video/gi.test(this.file.contentType);
	});

	itemSh.virtual('isAudio').get(function () {
		return /audio/gi.test(this.file.contentType);
	});

	itemSh.virtual('metadata').get(function () {
		return this.file.metadata;
	});

	itemSh.virtual('URI').get(function () {
		var url = '.' + this._id + '.';
		if(this.isImage)
			url += 'image';
		if(this.isVideo)
			url += 'video';
		if(this.isAudio)
			url += 'audio';
		return  url;
	});// 6332416

	itemSh.virtual('id_').get(function () {
		return GLOBAL.lib.base['64'].encode(this._id);
	});

	itemSh.method({
		toSOCKET : function (user) {
			var userId = GLOBAL._.isEmpty(user) ? '' : GLOBAL._.isEmpty(user._id) ? user :  user._id;
			var creatorId = GLOBAL._.isObject(this.creator._id) ? this.creator._id : this.creator;
			var docs = this.toJSON();
			docs.me = creatorId.toString() === userId.toString();
			return docs;
		},
		putFile : function (data, cb) {
			var item = this;
			//var data = new Buffer(data);
			GLOBAL.async.waterfall([
				function (callback) {
					exif.metadata(data, callback);
				},
				function (mts, callback) {
					var metas = {};
					for (var i in mts)
						metas[i] = mts[i];
					var uri = NoMongo.formatMongoose(GLOBAL.CONFIG.db.href || url.format(GLOBAL.CONFIG.db));
					mongo.mongo.MongoClient.connect(uri, function (err, db) {
						callback(err, db, metas);
					});
				},
				function (db, mts, callback){
					var gri = new GridStore(db, item._id.toString(), undefined, 'w', {
						metadata: mts,
						content_type: mts.mimeType || item.file.contentType,
						//w : 'a',
						root : ROOTFILES
					});
					gri.open(callback);
				},
				function (file, callback){
					file.write( data, true, callback);
				}
			], function (err, result) {
				if(err){
					cb(err);
				} else {
					item.file.id = result.fileId;
					item.file.contentType = result.contentType;
					item.save(function (err, doc) {
						cb(err, doc);
					});
				}
			});
		},
		getFile : function (cb) {
			var item = this;
			var name = item._id.toString();
			var uri = NoMongo.formatMongoose(GLOBAL.CONFIG.db.href || url.format(GLOBAL.CONFIG.db));
			mongo.mongo.MongoClient.connect(uri, function (err, db) {
				if(err) return cb(err);
				var store = new GridStore(db, name, 'r', { root: ROOTFILES } );
				store.open(cb);
			});
			
		},
		permanentLink : function () {
			var urlz  = GLOBAL.CONFIG.servers.api.url;
			if( this.creator.profile )
				urlz = urlz.replace(/api/gim, this.creator.profile.nick);
		
			urlz += this.id_;

			return urlz;
		},
		convertHtml : function () {
			var URIS = /(^|\s)http(s)?:\/\/([a-z0-9.]{3,})+.+(?:ac|ad|ae(ro)?|af|ag|ai|al|am|an|ao|aq|ar|as(ia)?|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi(z)?|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca(t)?|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co(m|op)?|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|edu|ee|eg|eh|er|es|et|eu(s)?|fi|fj|fk|fm|fo|fr|ga(l)?|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in(fo|t)?|io|iq|ir|is|it|je|jm|jo(bs)?|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo(bi)?|mp|mq|mr|ms|mt|mu(seum)?|mv|mw|mx|my|mz|na(me)?|nc|ne(t)?|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pr(o)?|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr(avel)?|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|yu|za|zm|zw)(\/($|[a-zA-Z0-9.,?'\/+&amp;%$#=~_-]+))*?(\s|$)/g;
			var replacers = [{
				patenr : /(^|\s)\@(\w+)/g,
				replace : '$1<a href="' + GLOBAL.CONFIG.servers.api.url.replace('api', '$2') + '">@$2</a>'
			},{
				patenr : /(^|\s)\#(\w+)/g,
				replace : '$1<a href="' + GLOBAL.CONFIG.servers.api.url.replace('api', 'search' ) + 'q?tag=%23$2">#$2</a>'
			}];
			var out = this.descri;

			for (var i = replacers.length - 1; i >= 0; i--)
				out = out.replace( replacers[i].patenr, replacers[i].replace );

			return out.replace(URIS, function (m1){
					var si = m1.replace( /http(s)?\:\/\//i, '');
					var sa = si.length >= num ? '...' : '' ;
					return ' <a href="' + m1 + '" target="_blank">' + si.substring(0, num) + sa + '</a> ' ;
				});
		},
		toNews : function () {
			var objs = { is : 3 };
			objs.id = this._id.toString();
			objs.date = this.dateLa;
			objs.user = this.creator;
			objs.item = this;
			objs.text = this.descri;
			objs.url = GLOBAL.CONFIG.servers.glph.url.replace('glph', objs.user.profile.nick) + objs.item.id_;
			return objs;
		}
	});

	itemSh.plugin(jsonSelect, '-tags -__v -id -file');

	itemSh.set('toJSON', {
		virtuals : true
	});

	itemSh.pre('remove', function (next) {
		var name = this._id.toString();
		var uri = NoMongo.formatMongoose(GLOBAL.CONFIG.db.href || url.format(GLOBAL.CONFIG.db));
		mongo.mongo.MongoClient.connect(uri, function (err, db) {
			if(err) return next(err);
			var grid = new GridStore(db, name, 'w');
			grid.open(function (err, store) {
				if(err) return next(err);
				store.unlink(function (err) {
					next(err);
				});
			});	
		});
	});

	itemSh.index({ descri: 'text', contentType: 'text' });
	itemSh.path('descri').validate(GLOBAL.lib.maxCaracteres( GLOBAL.CONFIG.basic.text.coment ), 'format');
	itemSh.path('file.contentType').validate(function (v) {
		return /(image|video|audio)\//gim.test(v);
	}, 'format');

	mongo.model( ROOTFILES + '.files', {});
	//mongo.model( ROOTFILES + '.chunks', {} );

	return mongo.model('item',	itemSh);
};