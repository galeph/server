const alert  = require('./alert');
const www	 = require(path.join(GLOBAL.dir, 'routes', 'www', 'controller'));
const glph   = require(path.join(GLOBAL.dir, 'routes', 'glph', 'controller'));
const shop   = require(path.join(GLOBAL.dir, 'routes', 'shop', 'controller'));
const search = require(path.join(GLOBAL.dir, 'routes', 'search', 'controller'));
const imports = require(path.join(GLOBAL.dir, 'routes', 'import', 'controller'));

/**
 * Contructor de socketes
 * @param  {Object} socket Instacion de Socket
 */
module.exports = function (socket){
	socket.on('test', alert.test);
	socket.on('view:glph:profile', glph.profile ); // Vista Perfil
	socket.on('view:glph:item', glph.item.view); // Vista Item 
	socket.on('view:glph:comment', glph.comment); // Vista Comentarios
	socket.on('view:glph:followers', glph.profile.follow.bind(socket, 'ers')); // Vista Comentarios
	socket.on('view:glph:following', glph.profile.follow.bind(socket, 'ing')); // Vista Comentarios

	// TODO socket.on('view:glph:album', glph.album); // Un solo album
	// TODO socket.on('view:glph:albumns', glph.album.list );
	
	socket.on('del:alert', alert );

	socket.on('view:search:user', search.view.users );
	socket.on('view:search:item', search.view.item.bind(socket, 'all') );
	socket.on('view:search:item:image', search.view.item.bind(socket, 'image') );
	socket.on('view:search:item:video', search.view.item.bind(socket, 'video') );
	socket.on('view:search:item:audio', search.view.item.bind(socket, 'audio') );

	socket.on('view:search:explore', search.view.explore );
	socket.on('view:search:top', search.view.top );

	socket.on('view:shop:cart', shop.cart.view );
	socket.on('add:shop:cart', shop.cart.add );
	socket.on('del:shop:cart', shop.cart.del );
	socket.on('notify:cart', shop.cart.send);

	if( socket.client.request.login ){
		socket.on('disconnect', alert.disconnect(socket));

		socket.on('view:glph:friend', glph.friend.view); // Segidores y siguiendo
		socket.on('view:import:contact', imports.contact.render); // Segidores y siguiendo

		socket.on('notify:news', www.news.count);
		socket.on('notify:sell', shop.checkout.count); // Falta
		socket.on('notify:bays', shop.checking.count);

		socket.on('view:shop:checkin', shop.checking.view);
		socket.on('view:shop:checkin:one', shop.checking.one);
		socket.on('add:shop:checkin', shop.checking.add );

		socket.on('view:shop:checkout', shop.checkout.view);
		socket.on('add:shop:checkout', shop.checkout.add );
		socket.on('view:shop:checkout:one', shop.checkout.view);
		socket.on('view:shop:checkout:table', shop.checkout.table);

		socket.on('view:www:item', www.timeline); // TimeLine
		socket.on('view:www:wellcome', www.wellcome );

		socket.on('view:www:news', www.news.view); // TODO terminar

		socket.on('change:item', glph.item.change);
		socket.on('change:settings', www.settings);

		socket.on('change:block', glph.friend.block);
		socket.on('change:follow', glph.friend.add);
		socket.on('change:favorite', glph.feedback.favorite);
		socket.on('change:like', glph.feedback.like);

		socket.on('view:feedback', glph.feedback.forAll);
		socket.on('add:comment', glph.comment.add);
		socket.on('delete:coment', glph.comment.remove);
		
		socket.on('search:follow', search.friend.all );
		socket.on('to:follow', search.friend.to );
		socket.on('delete:item', glph.item.delete); // TODO eliminar items

		// TODO socket.on('search:albums', search.albums );

		glph.item.add(socket);
	}
};

