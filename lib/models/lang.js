//Idiomas

module.exports = exports = function (mongo){

	var Mixed	= mongo.Schema.Types.Mixed;
	var ObjectId= mongo.Schema.Types.ObjectId;

	var langX = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		name	: { type : String, trim : true, unique : true },
		code	: { type : String, match : /^[a-z]{2}((\_[a-z]{2})|$)/, lowercase : true, trim : true, index : true, unique : true },
		words	: Mixed,
		extend	: [ { type : ObjectId } ] // ref: 'langs'
	});

	langX.static('findByLang', function (user, callback){
		return this.findOne({
			public : true,
			code : user
		}).populate('extend').exec(callback);
	});

	langX.method({
		gettext : function () {
			var keys = _.clone(this.words);
			for (var i = this.extend.length - 1; i >= 0; i--)
				keys = _.defaults(keys, this.extend[i].words );

			var args = Array.prototype.slice.call(arguments);
			var msgid = keys[ args[0] ] || args[0];

			if( _.isArray(msgid) ){
				msgid = _.compact(msgid);
				args[0] = msgid[0];
				if(msgid.length > 1 && _.isNumber(args[1]) ){
					for (var i = 0; i < msgid.length; i++) {
						if( i <= args[1] )
							args[0] = msgid[i];
					}
				}
			}
			return util.format.apply(this, args);
		}
	});

	return mongo.model('lang',	langX);
};