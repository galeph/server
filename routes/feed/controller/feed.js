module.exports = function(req, res, next){
	req.query.limit = ( req.query.limit || GLOBAL.CONFIG.response['item for page'] ) * 5;
	req.query.time = /years|quarters|months|weeks|days/i.test(req.query.time) ? req.query.time: 'weeks';
	var type = /rss|atom/i.test(req.query.feed) ? req.query.feed.toLowerCase() : 'rss';
	req.page.push(type);
	res.type(type);
	res.locals.is = req.params.cualquier;
	next();
};