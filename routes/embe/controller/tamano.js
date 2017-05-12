module.exports = function (req, res, next, valor){
	var width = _.toNumber( _.strLeft(valor, 'x') );
	var heigth = _.toNumber( _.strRight(valor, 'x') );
	var UNO = width > 1 ? width < 1501 : heigth > 1 && heigth < 850;
	next( UNO ? null : 'route' );
};
