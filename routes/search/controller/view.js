const querystring = require('querystring');
const times = /years|quarters|months|weeks|days/i;

/**
 * Visualizacion de busqueda por el tipo
 * @param  {String} name Tipo de busqueda
 * @param  {Object} data Object Master
 */
module.exports.item = function (name, data) {
	var socket = this;
	var query = _.clone(data.query);
	query.$text = { $search : data.query.q };
	delete query.q;
	GLOBAL.db.model('item')
		.find(query)
		.populate('creator')
		.skip( GLOBAL.CONFIG.response['item for page'] * data.page)
		.limit(GLOBAL.CONFIG.response['item for page'])
		.exec(function (err, doc) {
			if(err) socket.emit('error', err);
			var result = [];
			for (var i = doc.length - 1; i >= 0; i--)
				result.push( doc[i].toSOCKET(socket.client.request.user) );

			socket.emit('view',  result.reverse() );
		});
};

/**
 * Visualizacion de busqueda por el Usuario
 * @param  {Object} data Object Master
 */
module.exports.users = function (data) {
	var socket = this;
	var query = _.clone(data.query);
	query.$text = { $search : data.query.q };
	delete query.q;
	GLOBAL.db.model('user')
		.find(query)
		.skip( GLOBAL.CONFIG.response['item for page'] * data.page)
		.limit(GLOBAL.CONFIG.response['item for page'])
		.exec(function (err, doc) {
		if(err) socket.emit('error', err);
		socket.emit('view',  doc );
	});
};

/**
 * Visualizacion de exploracion
 * @param  {Object} data Object Master
 */
module.exports.explore = function (data) {
	var socket = this;
	data.query.time = times.test(data.query.time) ? data.query.time : 'weeks';
	GLOBAL.db.model('feed').find({
		view: {
			$gte : moment().subtract(1, data.query.time)
		}
	}).select('-form').exec(function (err, da) {
		if( err ) socket.emit( 'error', err  );
		var que = { public : true, $or : [] };
		for (var i = 0; i < da.length; i++)
			que.$or.push({ _id : da[i].item });
		if(que.$or.length === 0)
			delete que.$or;
		GLOBAL.db.model('item').find(que)
			.populate('creator')
			.limit( GLOBAL.CONFIG.response['item for page'] )
			.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
			.exec(function (err, items) {
				if(err) socker.emit('error', err);
				socket.emit('view', items);
			});
		});
};

/**
 * Visualizacion de top
 * @param  {Object} data Object Master
 */
module.exports.top = function (data) {
	var socket = this;
	data.query.time = times.test(data.query.time) ? data.query.time: 'weeks';
	GLOBAL.db.model('baucher').findAndCompact({
		date: {
			$gte : moment().subtract(1, data.query.time)
		},
		checkIn :{ $exists :true }
	}).exec(function (err, da) {
		if( err ) socket.emit( 'error', err || new Error( 'Invalid' ) );
		var que = { public : true, $or : [] };
		for (var i = 0; i < da.length; i++)
			que.$or.push({ _id : da[i].item });
		if(que.$or.length === 0)
			delete que.$or;
		GLOBAL.async.parallel({ 
			music : function (callback) {
				var query = _.clone(que);
				//query.
				GLOBAL.db.model('item').find(query)
					.populate('creator')
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.exec(callback);
			},
			image : function (callback) {
				var query = _.clone(que);
				//query.
				GLOBAL.db.model('item').find(query)
					.populate('creator')
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.exec(callback);
			},
			video : function (callback) {
				var query = _.clone(que);
				//query.
				GLOBAL.db.model('item').find(query)
					.populate('creator')
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.exec(callback);
			}
		}, function (err, doc) {
			if(err) socker.emit('error', err);
			socket.emit('view', doc);
		});
	});
};