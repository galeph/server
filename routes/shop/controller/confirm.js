/**
 * Confirmacion de la compra
 * @param  {Object}   req  Objecto de peticion
 * @param  {Object}   res  Objecto de respuesta
 * @param  {Function} next Seguir en el manual de funciones
 */
module.exports = function (req, res, next){
	GLOBAL.db.model('checkin')
		.findById(req.params.id)
		.populate('baucher')
		.exec(function (err, order) {
		if(err || _.isEmpty(order) || order.status === 2 )
			return next(err);

		order.confrimPayment(req.query, function (err, data){
			if(!_.isEmpty(err) || !_.isObject(data))
				return next(err);

			if(data.status == 1 && order.status != 1 ){
				order.status = data.status;
				GLOBAL.async.map(order.baucher, function (num, cb){
					num.checkIn = order._id;
					num.save(cb);
				}, function (err) {
					if(err) return next(err);
					order.save(function (err, doc) {
						next(err);
					});
				});
			} else {
				if(_.isNumber(data.status))
					order.status = data.status;
				order.save(function (err, doc) {
					next(err);
				});
			}
		});
	});
};
