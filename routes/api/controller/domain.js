/**
 * Analisador de 
 * @param  {[type]}   socket [description]
 * @param  {Function} next   [description]
 * @return {[type]}          [description]
 */
module.exports = function (socket, next){
	var reg = new RegExp( '^(localhost|' + GLOBAL.CONFIG.servers.api.hostname + ')' , 'i' );
	next( reg.test( socket.handshake.headers.host ) ? null : new Error('Invalid Domain') );
};
