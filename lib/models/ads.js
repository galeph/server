module.exports = exports = function (mongo){

	var ObjectId= mongo.Schema.Types.ObjectId;
	var Url		= mongo.SchemaTypes.Url;

	var ads = new mongo.Schema({
		public: { type : Boolean, required : true, default : true },
		system: { type : Boolean, required : true, default : true },
		compr : { type : ObjectId, ref: 'user', required : true, unique : true, }, // Usuario que compra
		image : { type : ObjectId, ref: 'img', required : true, unique : true }, // Imagen
		tiemp : { type : Date, required : true, default : Date.now() }, // Fecha de creacion
		//categ : { type : [ ObjectId ], ref: 'tags', index : true }, // Tags
		//sesio : { type : [ ObjectId ], ref: 'Session', index : true }, // Seciones que lo han visto
		click : { type : Boolean, required : true }, // Click o de views
		publi : { type : Boolean, required : true, default : true }, // ???
		numbe : { type : Number, required : true, Min: 0 }, // Numero en reduccion
		urls  : Url, // Url para donde va
		murls : { type : Url, unique : true }, // Url de mostras
		ofert : { type : Boolean, required : true, default : true }, // Oferta
		//pais  : { type : [ ObjectId ], ref: 'country', index : true }
	});

	return ads;
};