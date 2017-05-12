module.exports = function (data, req, res, next){
	req.page = [ 'item' ];
	GLOBAL.async.parallel({
		view :function (callback) {
			GLOBAL.db.model('feed').views(req.params.nit, callback);
		},
		item : function  (callback) {
			GLOBAL.db.model('item')
				.findItemAndUser(req.params.nit, data.user._id)
				.populate('album')
				//.populate('file.name')
				.populate('file.id')
				.exec(callback);
		},
		seller : function (callback) {
			GLOBAL.db.model('baucher').isBayCount(req.params.nit, callback);
		},
		likes : function (callback) {
			GLOBAL.db.model('feed').likes(req.params.nit, callback);
		},
		download : function (callback) {
			GLOBAL.db.model('baucher').findItemAndUser(req.params.nit, req.user, callback );
		},
		upSee : function (callback) {
			if(!req.user)
				return callback();
			GLOBAL.db.model('feed').onlyUp(req.user, req.params.nit, callback);
		},
		iLike : function (callback) {
			if(!req.user)
				return callback(null, false);

			GLOBAL.db.model('feed').item(req.user, req.params.nit, callback);
		}
	},  function (err, num){
		if( err || ( data.base === 'template' && _.isEmpty(num.item) ) )
			return next( err || new Error('Not Found item') );
		_.extend(data, num);
		next(data);
	});
};

//Manejo de items
module.exports.change = function(data){
	var socket = this;
	GLOBAL.db.model('item').findItemAndUser(data._id, socket.client.request.user._id )
		.exec(function (err, doc){
			if(err || _.isEmpty(doc) ){
				socket.emit('error', err || 'Is a not your item!' );
			} else {
				var alb = [];
				doc.album = [];
				doc.sell.is = _.isBoolean( data.sell ) ? data.sell : false;
				if( !_.isEmpty( data.descri ) && doc.descri != data.descri )
					doc.descri = data.descri.substring(0, GLOBAL.CONFIG.basic.text.coment );
				if( doc.sell.is ){
					if( _.isNumber( data.price ) && parseFloat( data.price ) != doc.sell.price ){
						doc.sell.price = parseFloat( data.price );
					}
				}
				if( Array.isArray(data.album)){
					for (var i = data.album.length - 1; i >= 0; i--)
						alb.push({ name : data.album[i], user : socket.client.request.user._id, portada : data._id });
				}
				GLOBAL.async.map(alb, function (mun, cb) {
					GLOBAL.db.model('albums').findOrCreate(mun, function (err, al) {
						if(err) return cb(err);
						doc.album.push( al._id );
						cb(err, true);
					});
				}, function (err){
					if(err) socket.emit('error', err );
					GLOBAL.async.parallel({
						lang : function (cb) {
							GLOBAL.db.model('lang').findById( socket.client.request.session.lang._id,  cb);
						},
						saver :function (cb) {
							doc.save(cb);
						}
					}, function (err, res) {
						if(err) socket.emit('error', err);
						socket.emit('mesg:shows', { msg : res.lang.gettext('info_up'), error : err });
						if( data.isNew )
							socket.emit('put', res.saver[0].toSOCKET(socket.client.request.user._id) );
					});
				});	
			}
		});
};
module.exports.add = function (socket) {
	var files = {};
	function start (data) {
		files[data.index] = {
			size : data.size,
			item : new ( GLOBAL.db.model('item') )({
				creator	: socket.client.request.user,
				dateCr	: new Date(),
				file  : {
					contentType : data.type
				}
			}),
			data : data.file,
			upload : data.file.length || 0,
			up : data.date
		};
		var sen = _.clone(files[data.index].item.toJSON());
		sen.index = data.index;
		socket.emit('add:item:ok', sen);
	}

	function upload (data) {
		if(files[data.index].size === files[data.index].upload){
			files[data.index].item.putFile(files[data.index].data, function (err, doc){
				if(err) socket.emit('error', err);
				var sen = _.clone(doc.toJSON());
				sen.index = data.index;
				delete files[data.index];
				socket.emit('add:item:final', sen);
			});
		} else {
			files[data.index].data += data.file.toString('ascii');
			files[data.index].upload += data.file.length;
            socket.emit('add:item:porcent', {
            	index : data.index,
            	percent : ( files[data.index].upload / files[data.index].size ) * 100,
            	place : files[data.index].upload / 524288
            });
		}
	}

	socket.on('add:item:start', start);
	socket.on('add:profile:start', start);
	socket.on('add:item:upload', upload);
	socket.on('add:profile:upload', upload);
};

module.exports.view = function (data) {
	var socket = this;
	GLOBAL.db.model('item').findById(data._id).populate('creator').exec(function  (err, doc) {
		if(err) socket.emit('error', error);
		socket.emit('view', doc);
	});
};

module.exports.delete = function (data) {
	var socket = this;
	GLOBAL.db.model('item').findItemAndUser(data._id, socket.client.request.user._id ).exec(function (err, doc) {
		if(err || _.isEmpty(doc)){
			socket.emit('error', err);
		} else {
			doc.public = false;
			doc.save(function (err) {
				if(err) socket.emit('error', err || new Error('No exist item') );
				socket.emit('delete', data);
			});
		}
	});
};
