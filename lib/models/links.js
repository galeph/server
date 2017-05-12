module.exports = exports = function (mongo){

	var links = new mongo.Schema({
		public	: { type : Boolean, required : true, default : true },
		starts  : { type : String, trim : true, required : true, unique : true,  index : true }, 
		original: { type : String, trim : true, required : true }, 
	});

	links.static('findByRegExp', function (url, callback){
		return this.findOne({
			public : true,
		})
			.$where('( new RegExp(obj.starts,"i") ).test("' + url + '")')
			.exec(callback);
	});

	links.virtual('regex').get(function () {
		return new RegExp( this.starts, 'i' );
	});

	return mongo.model('links',	links);
};

/*

galeph.com/about[?bla=*]
^galeph\.com\/(about|company)(\?|$)

*/
