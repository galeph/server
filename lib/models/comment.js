const deepPopulate = require('mongoose-deep-populate');
module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;

	var comentarios = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		text	: { type : String, trim : true },
		user	: { type : ObjectId, ref: 'user' },
		date	: { type : Date, default : Date.now },
		item	: { type : ObjectId, ref: 'item', required : true },
	});

	comentarios.static('findByUser', function ( itemz ){
		return this.find({
			public : true,
			user : itemz
		});
	});

	comentarios.static('findByItem', function (items, callback){
		var more = _.isObject(callback) ? callback : {};
		var cb;
		if( _.isFunction(callback))
			cb = callback;
		more.public = true;
		if( !Array.isArray(more.$or) ) more.$or = [];

		if(Array.isArray(items)){
			for (var i = items.length - 1; i >= 0; i--)
				more.$or.push({ item : items[i] });
		} else{
			more.$or.push({ item : items });
		}

		return this.find(more, cb );
	});

	comentarios.static('searchs', function (me, users, callback){
		var more = _.isObject(callback) ? callback : {};
		var cb;
		if( _.isFunction(callback))
			cb = callback;
		more.public = true;
		more.text = new RegExp( '@' + me, 'i');
		if( !Array.isArray(more.$nor) ) more.$nor = [];

		if(Array.isArray(users)){
			for (var i = users.length - 1; i >= 0; i--)
				more.$nor.push({ user : users[i]._id });
		} else{
			more.$nor.push({ user : users._id });
		}

		return this.find(more, cb );
	});

	comentarios.method({
		toNews : function () {
			var objs = { is : 1 };
			objs.id = this._id.toString();
			objs.date = this.date;
			objs.user = this.user;
			objs.item = this.item;
			objs.text = this.text;
			objs.url = GLOBAL.CONFIG.servers.glph.url.replace('glph', this.item.creator.profile.nick) + this.item.id_;
			return objs;
		}
	});

	comentarios.index({ text : 'text' });
	comentarios.plugin(deepPopulate);
	comentarios.path('text').validate( lib.maxCaracteres( GLOBAL.CONFIG.basic.text.coment ), 'format');

	return mongo.model('comment', comentarios);
};
