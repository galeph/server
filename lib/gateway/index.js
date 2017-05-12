module.exports = function () {
	var finds = _.filter(models, function (num, index) {
		return num.name;
	});
	return finds;
};

module.exports.get = function () {
	var finds = _.filter(models, function (num, index) {
		return num.name && num.get && _.isFunction(num.get.confirm);
	});
	return finds;
};

module.exports.send = function () {
	var finds = _.filter(models, function (num) {
		return num.name && num.send;
	});
	return finds;
};

module.exports.payment = function (name, and) {
	var and = _.isString(and) ? and : null;
	return _.find(models, function (num) {
		var test1 = num.name && num.name === name;
		return and ? test1 && num[and] :test1;
	});
};

// Modelos internos - 6268188 - 8438494772
var models = module.exports.payments = [];
var z = fs.readdirSync(__dirname);
for (var i = 0; i < z.length; i++)
	if( z[i] != 'index.js' )
		models.push(require(GLOBAL.path.join( __dirname, z[i] ) ) );