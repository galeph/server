/**
 * Tester de usuario/email
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 */
module.exports = function(req, res) {
	var field = req.body.field || req.query.field;

	if( _.isEmpty(field) || ( req.params.typx === 'mail' && !lib.testEmail(field) ) )
		return res.status(202).json({
			error : null,
			unique : false
		});
	
	GLOBAL.db.model('user').findByUser( field, req.user).count(function (err, num) {
		res.status(202).json({
			error : err,
			unique : num === 0
		});
	});
};