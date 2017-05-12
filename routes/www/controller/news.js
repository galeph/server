/**
 * Contador de notificaciones
 * @param  {String|Boolean|Object|null} data No Importa
 */
module.exports.count = function (data) {
	var socket = this;
	GLOBAL.async.parallel({
		block : function (callback) {
			GLOBAL.db.model('follow').Block(socket.client.request.user, callback);
		},
		items : function (callback) {
			GLOBAL.db.model('item')
				.findByUser(socket.client.request.user)
				.select('-date -dateLa -descri -dateCr -sell -licens -album -file')
				.exec(callback);
		}
	}, function (err, dt) {
		if(err) socket.emit('error', error);
		GLOBAL.async.parallel([
			function (callback) {
				var NOT = [ { public : false } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ form : dt.block[i].how });

				GLOBAL.db.model('follow')
					.ersNotify( socket.client.request.user._id, new Date(socket.client.request.user.connect.notic.news) )
					.nor(NOT)
					.exec('count', callback );
			},
			function (callback) {
				var NOT = [ { user : socket.client.request.user._id } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ user : dt.block[i].how });

				var YES = [ { text : { $regex: '@' + socket.client.request.user.profile.nick, $options: 'gim' } } ]; 
				for (var i = dt.items.length - 1; i >= 0; i--)
					YES.push({ item : dt.items[i]._id, date : {
							$gte : socket.client.request.user.connect.notic.news
						}});

				GLOBAL.db.model('comment')
					.find()
					.or(YES)
					.nor(NOT)
					.exec('count', callback );
			},
			function (callback) {
				var query = {
					like : {
						$gte : socket.client.request.user.connect.notic.news
					},
					form : { $ne : socket.client.request.user._id },
					$or  : [],
					$nor : []
				};

				for (var i = dt.block.length - 1; i >= 0; i--)
					query.$nor.push({ form : dt.block[i].how });

				for (var i = dt.items.length - 1; i >= 0; i--)
					query.$or.push({ how : dt.items[i]._id });

				if(!query.$or.length){
					delete query.$or;
					query.public = 1;
				}

				if(!query.$nor.length)
					delete query.$nor;

				GLOBAL.db.model('feed')
					.find(query)
					.exec('count', callback );
			},

			function (callback) {
				var NOT = [ { creator : socket.client.request.user._id } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ creator : dt.block[i].how });

				for (var i = dt.items.length - 1; i >= 0; i--)
					NOT.push({ _id : dt.items[i]._id });

				GLOBAL.db.model('item')
					.find({
						descri : { $regex: '@' + socket.client.request.user.profile.nick, $options: 'gim' },
						date  : {
							$gt : socket.client.request.user.connect.notic.news
						}
					})
					.nor(NOT)
					.exec('count', callback );
			}
		], function (err, doc) {
			if(err) socket.emit('error', err);
			var num = 0;
			for (var i = doc.length - 1; i >= 0; i--)
				num += doc[i];

			socket.emit('notify:news', num);
		});
	});
};

/**
 * Visualizacion de las notificaciones
 * @param  {Object} data Objecto de master
 */
module.exports.view = function (data){
	var socket = this;
	GLOBAL.async.parallel({
		block : function (callback) {
			GLOBAL.db.model('follow').Block(socket.client.request.user, callback);
		},
		items : function (callback) {
			GLOBAL.db.model('item')
				.findByUser(socket.client.request.user)
				.select('-date -dateLa -descri -dateCr -sell -licens -album -file')
				.exec(callback);
		}
	}, function (err, dt) {
		if(err) socket.emit('error', error);
		GLOBAL.async.parallel([
			function (callback) {
				var NOT = [ { public : false } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ form : dt.block[i].how });

				GLOBAL.db.model('follow')
					.ers( socket.client.request.user._id )
					.nor(NOT)
					.populate('form')
					.sort('-date')
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.exec(callback );
			},
			function (callback) {
				var NOT = [ { user : socket.client.request.user._id } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ user : dt.block[i].how });

				var YES = [ { text : { $regex: '@' + socket.client.request.user.profile.nick, $options: 'gim' } } ];
				for (var i = dt.items.length - 1; i >= 0; i--)
					YES.push({ item : dt.items[i]._id });

				GLOBAL.db.model('comment')
					.find()
					.or(YES)
					.nor(NOT)
					.sort('-date')
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.deepPopulate('user item.creator')
					.exec(callback );
			},
			function (callback) {
				var query = {
					form : { $ne : socket.client.request.user._id },
					$or  : [],
					$nor : []
				};

				for (var i = dt.block.length - 1; i >= 0; i--)
					query.$nor.push({ form : dt.block[i].how });

				for (var i = dt.items.length - 1; i >= 0; i--)
					query.$or.push({ how : dt.items[i]._id });

				if(!query.$or.length)
					delete query.$or;

				if(!query.$nor.length)
					delete query.$nor;

				GLOBAL.db.model('feed')
					.find(query)
					.sort('-like')
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.populate('how')
					.populate('form')
					.exec(callback);
			},
			function (callback) {
				var NOT = [ { creator : socket.client.request.user._id } ];
				for (var i = dt.block.length - 1; i >= 0; i--)
					NOT.push({ creator : dt.block[i]._id });

				for (var i = dt.items.length - 1; i >= 0; i--)
					NOT.push({ _id : dt.items[i]._id });

				GLOBAL.db.model('item')
					.find({
						descri : { $regex: '@' + socket.client.request.user.profile.nick, $options: 'gim' },
					})
					.nor(NOT)
					.sort('-date')
					.skip( data.page * GLOBAL.CONFIG.response['item for page'] )
					.limit( GLOBAL.CONFIG.response['item for page'] )
					.populate('creator')
					.exec(callback );
			}
		], function (err, doc) {
			var bas = [];
			if(err) socket.emit('error', err);

			for (var i = doc.length - 1; i >= 0; i--){
				for (var j = doc[i].length - 1; j >= 0; j--) {
					bas.push( doc[i][j].toNews(socket.client.request.user) );
				}
			}

			socket.emit('view', _.sortBy(_.compact(bas), function (item) {
				var times = item.date;
				return _.isDate(times) ? times.getTime() : null;
			}).reverse() );
		});
	});
};
