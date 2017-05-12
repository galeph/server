/**
 * Modificador de configuracion
 * @param  {Object}   data  Informacion para modificar
 * @param  {Function} calls Funcion de ejecuion final
 */
module.exports = function (data, calls){
	var socket = this;
	GLOBAL.db.model('user').findById(socket.client.request.user, function (err, doc){
		if ( !err || !_.isEmpty(doc) ) {
			var tos =[];
			if( ( _.isString(data.review) && doc.isValidPassword( data.review )) || doc.isValidPassword(doc._id.toString() ) ){
				if(data.type === 'account'){
					if ( _.isString( data.name ) && data.name != doc.profile.name  ) {
						doc.profile.name = data.name;
						tos.push('nombre');
					}
					if ( _.isString( data.lang ) && ( !doc.connect.lang || data.lang != doc.connect.lang.toString() ) ) {
						doc.connect.lang = data.lang;
						tos.push('lang');
					}
					if ( _.isString( data.nick ) && data.nick != doc.profile.nick ) {
						doc.profile.nick = data.nick;
						tos.push('nombre user');
					}
					if ( _.isString( data.principal ) && data.principal != doc.connect.emailStar.toString() ) {
						var is = _.find(doc.connect.emails, function (item) {
							return item._id.toString() === data.principal;
						});
						if(is){
							doc.connect.emailStar = data.principal;
							tos.push('email');
						}
					}

					if(data.email){
						var is = _.find(doc.connect.emails,function (item) {
							return item.mail.toLowerCase() === data.email.toLowerCase();
						});

						if(lib.testEmail(data.email) && !is ){
							doc.connect.emails.push({
								mail : data.email
							});
							tos.push('push email');
						}
					}
				} else if( data.type === 'password' && _.isString( data.npass ) && data.npass === data.rpass ){
					doc.setPassword(data.npass);
					tos.push('pass');
				} else if( data.type === 'notification' ){
					doc.connect.notic.send = data.infos;
					doc.connect.notic.trans = data.basic;
					tos.push('noti');
				}
			} else if( data.type === 'avata' || data.type === 'porta' || data.type === 'profile' ){
				if ( data.type === 'avata' && _.isString( data.send ) ) {
					doc.profile.avata = data.send;
					tos.push('avata');
				}
				if ( data.type === 'porta' && _.isString( data.send ) ) {
					doc.profile.porta = data.send;
					tos.push('porta');
				}
				if ( data.descr != doc.profile.descr && _.isString( data.descr ) ) {
					doc.profile.descr = data.descr;
					tos.push('descr');
				}
				if ( data.urlwe != doc.profile.urlwe && _.isString( data.urlwe ) && !_.isEmpty( data.urlwe ) ) {
					doc.profile.urlwe = data.urlwe;
					tos.push('urlw');
				}	
			} else if( data.type === 'email' && data.id != doc.connect.emailStar.toString() ){
				var is = _.find(doc.connect.emails,function (item) {
					return item.id.toString() === data.id;
				});
				doc.connect.emails.pull(is);
			}
			/*if (data.type === 'pro' && new Date( data.send.dateN ) != doc.profile.dateN ) {
				doc.profile.fechn = new Date(data.send.dateN);
				tos.push('fecha_nace');
			}*/
			GLOBAL.async.parallel({
				lang : function (cb) {
					GLOBAL.db.model('lang').findById( socket.client.request.session.lang._id,  cb);
				},
				saver :function (cb) {
					doc.save(cb);
				}
			}, function (err, res) {
				if(err) socket.emit('error', err);
				if(calls) calls();
				//socket.emit('mesg:shows', { msg : res.lang.gettext('info_profile'), error : err,});
				socket.emit('put:settings', {  profile : res.saver[0], type : data.type });
			});
		} else {
			GLOBAL.db.model('lang').findByLang( socket.client.request.session.lang, function (err, doc){
				if(err) socket.emit('error', err);
				socket.emit('mesg:shows', { msg : res.lang.gettext('i_no_know'), error : err });
			});
		}
	});
};
