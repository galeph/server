const findOrCreate = require('mongoose-findorcreate');
module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;

	var followSchema = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true }, // Block --> False // Segir --> True
		how		: { type: ObjectId, ref: 'user', required : true },
		form	: { type: ObjectId, ref: 'user', required : true },
		date	: { type : Date }
	});

	followSchema.static('erThis', function (me, other, block, callback){
		var query = {
			form : _.isObject(me) ? me._id : me,
			how : _.isObject(other) ? other._id : other,
			date : { $type : 9 }
		};

		if(!_.isFunction(block) )
			query.date.$type = 10;

		return this.findOne(query, _.isFunction(block) ? block : callback);
	});

	followSchema.static('me', function (me, callback){
		return this.find({
			form :  GLOBAL._.isObject(me) ? me._id : me
		}, callback );
	});

	followSchema.static('ersNotify', function (me, dates, callback){
		return this.find({
			form :  GLOBAL._.isObject(me) ? me._id : me,
			date : { $gte : dates }
		}, callback );
	});

	followSchema.static('ers', function (me, callback){
		var query = {
			date : { $type : 9 },
			how : _.isObject(me) ? me._id : me
		};

		if(!_.isFunction(callback) && callback)
			query = callback;

		return this.find(query, _.isFunction(callback) ? callback : null );
	});

	followSchema.static('ing', function (me, callback){
		var query = {
			date : { $type : 9 },
			form : _.isObject(me) ? me._id : me
		};

		if(!_.isFunction(callback) && callback)
			query = callback;

		return this.find(query, _.isFunction(callback) ? callback : null );
	});

	followSchema.static('Block', function (me, callback){
		var query = { 
			date : { $type : 10 },
			form : _.isObject(me) ? me._id : me
		};

		if(!_.isFunction(callback) && callback)
			query = callback;

		return this.find(query, _.isFunction(callback) ? callback : null );
	});

	followSchema.static('CreateOrDelete', function (me, other, block, callback){
		var selft = this;
		return selft.erThis(me, other, function (err, doc) {
			if(err)
				return callback(err);

			if(_.isObject(doc)){
				doc.remove(function(err) {
					callback(err);
				});
			} else {
				var nuevo = new selft({
					how  : other,
					form : me,
					date : other ? new Date() : null
				});

				nuevo.save(function(err, doc) {
					callback(err, doc);
				});
			}
		});
	});

	followSchema.method({
		toNews : function () {
			var objs = { is : 2 };
			objs.id = this._id.toString();
			objs.date = this.date;
			objs.user = this.form;
			objs.url = GLOBAL.CONFIG.servers.glph.url.replace('glph', objs.user.profile.nick);
			return objs;
		}
	});

	followSchema.plugin(findOrCreate);

	return mongo.model('follow', followSchema);
};
