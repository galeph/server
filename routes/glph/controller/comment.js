
module.exports = function (data) {
	var socket = this;
	GLOBAL.db.model('comment')
		.findByItem( lib.base['64'].decode( data.nit ) )
		.populate('user')
		.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
		.limit( GLOBAL.CONFIG.response['item for page'] )
		.sort('-date')
		.exec( function (err, docs){
			if ( err ) socket.emit('error', err );
			socket.emit('view', docs);
		});
};

module.exports.add = function (data) {
	var socket = this;
	if( data.nit ) data.item = lib.base['64'].decode( data.nit );
	var nuevo = new ( GLOBAL.db.model('comment') )(data);
	nuevo.user = socket.client.request.user._id;
	nuevo.save(function (err, doc) {
		if(err) socket.emit('error', err);
		if(data.send){
			doc.populate('user', function(err, doc){
				if(err) socket.emit('error', err);
				socket.emit('put', doc);
			});
		}
	});
};

module.exports.remove = function (data) {
	var socket = this;
	GLOBAL.db.model('comment')
		.findById(data, function (err, doc) {
		if(err|| _.isEmpty(doc))
			return socket.emit('error', err);
		if(doc.user.toString() === socket.client.request.user._id.toString() ){
			GLOBAL.async.parallel({
				remove : function(calls){
					doc.remove(calls);
				},
				lang : function (cb) {
					GLOBAL.db.model('lang').findById( socket.client.request.session.lang._id,  cb);
				}
			}, function (err, rs){
				if(err) socket.emit('error', err);
				socket.emit('mesg:shows', { msg : rs.lang.gettext('del_com') });
				socket.emit('coment:delete',{
					nit : data._id,
					error : null
				});
			});
		}
	});
};
