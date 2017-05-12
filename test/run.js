const child = require('child_process');

GLOBAL.os		= require('os');
GLOBAL.fs		= require('fs');
GLOBAL.url		= require('url');
GLOBAL.sys		= require('sys');
GLOBAL.dns		= require('dns');
GLOBAL.util		= require('util');
GLOBAL.path		= require('path');
GLOBAL.async	= require('async');
GLOBAL.moment	= require('moment');
GLOBAL._		= require('underscore');
GLOBAL._.str	= require('underscore.string');
GLOBAL.express	= require('express');
GLOBAL.mime		= require('mime');

GLOBAL._.mixin(GLOBAL._.str.exports());

GLOBAL.dir		= GLOBAL.path.join( __dirname, '..' );

module.exports = function () {
	describe('Funciones Base', function(){
		var list = ['actio', 'master', 'lin', 'connect'];
		it('En objecto',function(){
				= require( GLOBAL.path.join(GLOBAL.dir, 'package.json' ) );
			GLOBAL.action	= require(GLOBAL.path.join(GLOBAL.dir, 'lib','action.js' ));
			GLOBAL.lib		= require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'index.js'));
			GLOBAL.connect	= require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'models' ));
			for (var i = list.length - 1; i >= 0; i--) {
				assert.equal(typeof GLOBAL[list[i]], 'Object' );
			};
		});
	});
};
