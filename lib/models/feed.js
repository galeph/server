const jsonSelect = require('mongoose-json-select');
const findOrCreate = require('mongoose-findorcreate');
module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;

	var feedBackSchema = new mongo.Schema({
		public : { type : Boolean, required : true, default : true },
		how    : { type: ObjectId, ref: 'item', required : true },
		form   : { type: ObjectId, ref: 'user', required : true },

		favo   : { type : Date },
		like   : { type : Date },
		view   : { type : Date }
	});

	// feedback.like( idUser, idItem, function(err, true/false))
	feedBackSchema.static('item', function ( UserId, Other, callback){
		if(_.isEmpty(Other) && callback)
			return callback();

		return this.findOne({
			form : _.isObject(UserId) ? UserId._id : UserId,
			how : _.isObject(Other) ? Other._id : Other,
			public : true
		}, callback);
	});

	// feedback.like( idUser, idItem, function(err, true/false))
	feedBackSchema.static('likes', function ( id, callback){
		return this.count({
			how  : _.isObject(id) ? id._id : id,
			like : {
				$type : 9
			},
			public : true
		}, callback);
	});

	feedBackSchema.static('favorites', function (UserId, callback){
		return this.find({
			form :  GLOBAL._.isObject(UserId) ? UserId._id : UserId,
			favo : {
				$type : 9
			},
			public : true
		}, callback);
	});

	feedBackSchema.static('views', function (UserId, callback){
		return this.count({
			how :  GLOBAL._.isObject(UserId) ? UserId._id : UserId,
			view : {
				$exists : true
			},
			public : true
		}, callback);
	});

	feedBackSchema.static('changes', function (type, UserId, Other, callback){
		var selt = this;
		var query = {
			form : _.isObject(UserId) ? UserId._id : UserId,
			how : _.isObject(Other) ? Other._id : Other,
			public : true
		};
		
		return selt.findOne(query, function (err, doc) {
			if(err) return callback(err, doc);
			if(!_.isObject(doc)) doc = new selt(query);
			
			doc[type] = doc[type] ? null : new Date();

			doc.save(function(err, dos){
				callback(err, dos);
			});
		});
	});

	feedBackSchema.static('onlyUp', function (UserId, Other, callback){
		var selt = this;
		var query = {
			form : _.isObject(UserId) ? UserId._id : UserId,
			how : _.isObject(Other) ? Other._id : Other,
			public : true
		};
		
		return selt.findOne(query, function (err, doc) {
			if(err) return callback(err, doc);
			if(!_.isObject(doc)) doc = new selt(query);
			doc.view = new Date();

			doc.save(callback);
		});
	});

	feedBackSchema.method({
		toNews : function (me) {
			var objs = { is : 0 };
			objs.url = GLOBAL.CONFIG.servers.glph.url.replace('glph', me.profile.nick);
			objs.id = this._id.toString();
			objs.date = this.like;
			objs.user = this.form;
			objs.item = this.how;
			if(!this.how)
				return null;

			objs.url += this.how.id_;
			return objs;
		}
	});

	feedBackSchema.plugin(jsonSelect);
	feedBackSchema.plugin(findOrCreate);

	return mongo.model('feed', feedBackSchema);
};
