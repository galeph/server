/*
 * GET home page.
 */
module.exports = function () {
	var router = GLOBAL.express.Router();

	//router.use( routes.vars );
	//ads.post('/:number',	lib.segurity.basic, routes.ads.index);

	//ads.get('/create/:id?',	lib.segurity.login(true),	routes.ads.images);
	//ads.post('/create/:id?',lib.segurity.login(true),	routes.ads.create);

	//	Rutas
	//:id=:simple=:session
	//ads.get('/:session=:simple=:image~:id',	lib.segurity.basic, routes.ads.view, routes.ads.SendImage ); 
	//ads.get('/:id=:simple=:nit=:session',	lib.segurity.basic, routes.ads.click);

	//router.get('/views/:template.:tipe', login(true), routes.template('ads'));

	return router;

};

var home = function(req, res, next){
	if( !_.isEmpty( req.data.ads ) && _.isNumber( req.data.ads.number ) ){
		req.data.ads.number = !_.isEmpty( req.data.ads.number ) ? parseFloat( req.params.vars ) || 6 : req.data.ads.number;
		req.list = _.union( req.data.tags, !_.isEmpty(req.user) ? req.data.tags : req.body.list || [] );
		ads.index( req.list, req.data.ads, req.sessionID, req.geo, false, function(err, pub){
			if ( err ) req.error.s.push( err );
			req.data.ads.is = pub;
			next(err);
		});
	} else {
		next();
	}
};

var view = function(req, res, next){
	ads.view( req.params.id, function (err, doc){
		if( !err  && _.isObject(doc) ){
			if( !doc.click ) doc.numbe = doc.numbe - 1;
			req.params.tamano = '250z250';
			//doc.sesio.push( req.sess._id );
			doc.save( next );
		} else {
			next(new Error('Invalid') );
		}
	});
};

var click = function(req, res, next){
	ads.view( req.params.simple, function (err, doc){
		var is = lib.base['64'].decode( req.params.nit );
		if( !err && doc.compr.toString() == is ){
			if( doc.click ) doc.numbe = doc.numbe - 1 ;
			doc.save(console.error);
			res.redirect( doc.murls );
		} else {
			req.error.s.push(new Error('nohabe') );
			req.error.n = 500;
			next();
		}
	});
};

var shop = function(req, res, next){
	if( res.locals.login && _.isObject( req.compra ) ){
		//TODO porner mas seguridad
		sotre.compra({
			image : req.body.image,
			cate : req.body.cate,
			click:  req.body.click,
			numb : parseFloat( req.body.numb ),
			urls : req.body.urls ? req.body.urls : GLOBAL.CONFIG.servers.www.url + req.body.image,
			ulrm : req.body.urls ? req.body.urls : GLOBAL.CONFIG.servers.www.url + req.user.apodo,
			oferts : !req.body.urls,
			contry : req.body.contry
		}, req,user,function(err, doc){
			if(err)
				req.error.s.push( err );
			req.compras = doc;
			next();
		});
	} else {
		req.error.s.push( new Error( 'nohabe') );
		req.error.n = 500;
		next();
	}
};

var segurity = function( req, res, next){
	if( _.isEmpty(req.session) ){ // TODO colocar seguridad
		req.error.s.push( new Error( 'nohabe') );
		req.error.n = 500;
	}
	next();
};

var create = function(req, res, next) {
	// TODO Ojo!!! Aqui ahy que modificar!!
	_.extend(req.body, JSON.parse( req.body.json ) );
	req.body.img._id =  lib.base['64'].decode(req.body.img.id);
	req.body.tags = req.body.tags.split(', ');
	async.map( req.body.tags, store.tags.insert, function (err, result){
		if( err ) console.error(err, result);
		store.ads.create( req.body, req.user, result, function(err, doc){
			console.log(err, doc);
		});
	});
};

var images = function(req, res, next) {
	res.locals.css.push( 'pub' );
	req.page.push( 'pub');
	res.locals.classes.push('pub_create');
	res.locals.search = false;
	img.see.allUser(req.user._id, function(err, doc){
		if(err) next(err);
		req.data.images = doc;
		if(req.params.id) req.data.select = req.params.id;
		store.cupons.index(req.user._id, function (error, docs) {
			if(err) next(err);
			req.data.copuns = docs;
			next();
		});
	});
};

exports.SendImage = function(req, res, next) {
	var urls = new Array( path.join( GLOBAL.tmp, 'img', req.params.image) );
	fs.exists(urls[0], function (exists) {
		async.parallel({
			see : function(callback){
				!exists ?
					img.see.index(req.params.image, callback) : callback(null, true);
			},
			acount: function(callback){
				img.see.acount( req.params.image, false, res.locals.login, _.isEmpty(req.user) ? req.sessionID : req.user._id , callback);
			},
			settings : function(callback){
				// req.params.tamano = lib.base['32'].decode( req.params.tamano );
				callback(null, lib.Is.thumb( urls,
					_.toNumber( _.strLeft(req.params.tamano, 'z') ),
					_.toNumber( _.strRight(req.params.tamano, 'z') ) ) ); //Generar thumbs
			}
		}, function(err, all){
			if( err || _.isNull( all.acount ) || _.isNull( all.settings ) || _.isNull( all.see ) )
				return next(new Error( err ? err : 'No se tiene conocimento para hacer esa accion' ) );
			var convert = childp.spawn('convert', all.settings );
			res.contentType(new String( all.acount['type']));
			convert.stdout.pipe( res );
			convert.stderr.pipe( process.stderr );
		});
	});
};
