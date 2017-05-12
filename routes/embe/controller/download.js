const contentDisposition = require('content-disposition');
const mime = require('mime');

module.exports = function(req, res, next) {
	GLOBAL.async.parallel({
		isBay : function (callback) {
			GLOBAL.db.model('baucher')
				.findItemAndUser(req.params.id, req.user)
				.populate('seller')
				.populate('item')
				.exec(callback);
		},
		isMy : function (callback) {
			GLOBAL.db.model('item')
				.findItemAndUser(req.params.id, req.user)
				.exec(callback);
		}
	}, function (err, result) {
		var item;
		if(result.isBay)
			item = result.isBay.item;

		item = item || result.isMy;

		if(!item || err)
			return next(err || new Error('Forse the download'));

		GLOBAL.async.parallel({
			see : function (callback) {
				item.getFile(callback);
			},
			header : function (callback){
				var user = ( result.isBay ? result.isBay.seller : req.user );
				var name = ( item.descri || item.id_ ) + ' - ';
				name += user.profile.name  + ' @' + user.profile.nick;
				name += '.' + mime.extension(item.file.contentType);
				res.setHeader('Content-Disposition', contentDisposition( name ));
				callback();
			}
		}, function (err, arg) {
			if(err) return next(err);
			arg.render = arg.see.stream();
			arg.type = 'application/octet-stream';
			arg.date = item.date;
			arg.download = true;
			next(arg);
		});
	});
};