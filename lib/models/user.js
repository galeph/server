/*

1- Facebook
	- Imagenes publicas
	- Avatar

3- Flickr
	- Imaganes

4- SoundCloud
	- Musica

5- PayPal

6- tumbr
	- Images

7- vkontakte
	- Imagenes

8- Instagram
 	- Imagenes

- Like - Item
- Mencionen
- Comenten propias
- Comprando


*/
const crypto = require('crypto');
const base32 = require('base32');
const jsonSelect = require('mongoose-json-select');
const reg = /^[a-z]{1}[a-z0-9_-]{3,13}[a-z|0-9]{1}$/i;

function password ( val, salt) {
	return crypto.createHash( GLOBAL.CONFIG.basic.crypto.algo,
			base32.encode( new Buffer( salt.toString(), 'hex').toString('base64') ) )
			.update( val + salt.toString(), GLOBAL.CONFIG.basic.crypto.type )
			.digest( GLOBAL.CONFIG.basic.crypto.dige );
}

module.exports = exports = function (mongo){

	const ObjectId = mongo.Schema.Types.ObjectId;
	const Url	   = mongo.SchemaTypes.Url;
	const Email	   = mongo.SchemaTypes.Email;
	
	var MailSchema = new mongo.Schema({
		mail : { type : Email, required : true, unique : true, trim : true, index : true },
		confirm : { type : Boolean, required : true, default : false },
	});

	var UserSchema = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		date	: { type : Date, default : Date.now, required : true },
		certi	: { type : Boolean, required : true, default : false },
		profile : {
			nick  : { type : String, required : true, unique : true, trim : true, index : true, match : reg },
			name  : { type : String, trim : true },
			descr : { type : String, trim : true },
			avata : { type: ObjectId, ref: 'items' }, // Config default : _id por defecto
			porta : { type: ObjectId, ref: 'items' }, // Config default : _id por defecto
			urlwe : Url, // Config
		},
		connect : {
			lang : { type: ObjectId, ref: 'lang' },
			emailStar : { type: ObjectId, required : true, unique : true },
			emails : [ MailSchema ],
			social : {
				facebook: { type: ObjectId, ref: 'external' },
				google	: { type: ObjectId, ref: 'external' },
				paypal	: { type: ObjectId, ref: 'external' },
			},
			notic : {
				news : { type : Date, index : true, required : true, default : Date.now },
				sell : { type : Date, index : true, required : true, default : Date.now },
				bays : { type : Date, index : true, required : true, default : Date.now },
				mail : { type : Date, index : true, required : true, default : Date.now },

				send : { type : Number, required : true, default : 0 },
				trans : { type : Boolean, required : true, default : true },
			}
		},
		segurity : {
			clave : { type : String, required : true },
			login : { type : Boolean, required : true, default : false },
		}
	});

	UserSchema.static('Reset', function (callback){
		var selft = this;
		selft.find(function (err, docs){
			if( err )
				return callback( err );
			GLOBAL.async.map(docs, function (doc, cb) {
				if( doc.segurity.login)
					doc.segurity.login = false;
				doc.save(cb);
			}, callback );
		});
	});

	UserSchema.static('findByUser', function ( data, user, callback ){
		var query = {}, cb;
		if(_.isFunction(user))
			cb = user;
		if(_.isFunction(callback))
			cb = callback;

		if(_.isObject(user) && !_.isFunction(user))
			query._id = { $ne : user.profile ? user._id : user };

		if( reg.test(data) && lib.testName(data) ){
			query['profile.nick'] = new RegExp('^' + data.toLowerCase() + '$', 'i');
		} else if( lib.testEmail( data ) ){
			query['connect.emails.mail'] = data.toLowerCase();
		} else {
			return cb ? cb(null, null) : this.find({ public : true });
		}
		
		return this.find(query, cb);
	});

	UserSchema.static('Connect', function (UserId, on, callback){
		return this.findById(UserId, function (err, doc){
			if(err || !GLOBAL._.isObject(doc))
				return callback(err || new Error('No exist user'));
			doc.segurity.login = on;
			doc.save(callback);
		});
	});

	UserSchema.static('AddTags', function (id, tags, callback){
		for (var i = tags.length - 1; i >= 0; i--)
			this.findByIdAndUpdate(id, { $push: { tags : tags[i]._id } }, callback);
	});

	UserSchema.static('findAvatar', function (name, callback){
		if(GLOBAL._.isEmpty(name))
			return callback(new Error('No Exists'));
		return this.findByUser(name).populate('profile.avata').exec('findOne', callback);
	});

	UserSchema.static('findExternal', function (name, callback){
		return this.findAvatar(name)
			.populate('connect.social.google')
			.populate('connect.social.twitter')
			.populate('connect.social.facebook')
			.populate('connect.social.paypal')
			.exec('findOne', callback);
	});

	UserSchema.static('findCertified', function (is, callback){
		return this
			.find({
				public : true,
				certi : is
			}, callback);
	});

	UserSchema.static('findToFollow', function (query, callback){
		return this.aggregate()
			.match(query)
			.group({
				_id : '$_id'
			});
	});

	UserSchema.method({
		setPassword : function (passwordString) {
			this.segurity.clave = password( passwordString, this._id );
		},
		isValidPassword : function (passwordString) {
			return this.segurity.clave === password( passwordString, this._id );
		},
		nuevaFecha : function ( notis ) {
			this.connect.notic[ notis ] = new Date();
		},
		linkActive : function (id) {
			var is = this.connect.principal;
			if(id) is = _.find(this.connect.emails, function (item) {
				return item._id.toString() === id.toString();
			});
			var arry = [ this._id.toString(), new Date(), is.mail, is._id.toString() ];
			return 'active/' + lib.base[ '32' ].encode( JSON.stringify(arry) );
		},
		to : function (id) {
			var id = id || this.connect.emailStar;
			var to = this.profile.name + ' <';
			to += _.find(this.connect.emails, function (item) {
				return item._id.toString() === id.toString();
			}).mail;
			return to + '>';
		},
		forMe : function () {
			return {
				mail : this.connect.principal,
				id   : this._id.toSitrng()
			};
		}
	});

	UserSchema.virtual('profile.avatar').get(function () {
		return '/' + this._id + '.user.avatar'  ;
	});

	UserSchema.virtual('profile.top').get(function () {
		return '/' + this._id + '.user.cover';
	});

	UserSchema.virtual('connect.principal').get(function () {
		var ps = this.connect.emailStar;
		return _.find(this.connect.emails, function (item) {
			return item._id.toString() === ps.toString();
		});
	});

	UserSchema.virtual('recover').get(function () {
		var arry = [ this._id.toString(), new Date() ];
		return 'change/' + lib.base[ '32' ].encode( JSON.stringify(arry) );
	});

	UserSchema.set('toJSON', {
		virtuals : true
	});

	UserSchema.index({ 'profile.nick' : 'text', 'profile.name' :'text', 'profile.descr' : 'text' });
	UserSchema.plugin(jsonSelect, '-segurity -connect -tags -to -recover');
	
	MailSchema.path('mail').validate( lib.testEmail, 'TestEmail');

	UserSchema.path('profile.nick').validate( lib.testName, 'Test User');
	UserSchema.path('profile.name').validate( lib.maxCaracteres( GLOBAL.CONFIG.basic.text.name ),'Length max');
	UserSchema.path('profile.descr').validate( lib.maxCaracteres(GLOBAL.CONFIG.basic.text.coment ),'Length max');
	UserSchema.path('connect.emails').validate( function (val) {
		return val.length >= 1;
	},'length min');
	
	UserSchema.path('connect.emailStar').validate( function (val) {
		return _.find(this.connect.emails, function (item) {
				return item._id.toString() === val.toString();
			}) ? true : false;
	},'Selector email');

	//UserSchema.path('profile.dateN').validate( helpers.validator.mayor( config['years'].mayor ), 'error_edad');
	//UserSchema.path('profile.dateN').validate( helpers.validator.minor( config['years'].minor ), 'error_edad1');

	return mongo.model('user', UserSchema);
};
