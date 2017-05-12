const names = require('../country.json' );

module.exports = exports = function (mongo){

	var pais = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		name	: { type : String, trim : true, index : true, unique : true },
		code	: { type : String, match : /^(?:[a-z]{2})$/, lowercase : true, trim : true, index : true, unique : true },
		method	: [ { type : String, lowercase : true, trim : true, index : true } ],
	});

	pais.static('valid', function (name, callback){
		this.findOne({ 'name' : name }, function (err, doc){
			callback( err || !_.isObject(doc) ? false : doc.public );
		});
	});

	pais.static('findByIp', function (obj, callback){
		
		var model = this;
		var doc, obj;
		if(_.isEmpty(obj))
			obj = { country : 'ZZ' };

		model.findOne({
			code : ( obj.country + '' ).toLowerCase()
		}, function (err, doc) {
			if(err || !_.isEmpty(doc))
				return callback(err, doc);
			doc = new model({
				code : obj.country,
				name : names[ obj.country ],
				method : [ 'coinbase', 'paypal', 'conekta' ]
			});
			doc.save(function (err, doc) {
				callback(err, doc);
			});
		});
	});

	return mongo.model('country', pais);
};
