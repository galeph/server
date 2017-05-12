var _        = require('underscore');
const fs     = require('fs');
const mime   = require('mime');
const os     = require('os');
const path   = require('path');
const sys    = require('sys');
const util   = require('util');
const assert = require('assert');
const dir    = path.join( __dirname, '..' );
const master = require( path.join(dir, 'package.json' ) );

_.str        = require('underscore.string');
_.mixin(_.str.exports());

var tests = {};
var z = fs.readdirSync(__dirname);

for (var i = 0; i < z.length; i++)
	if( !/(index\.js|views|javascripts)/.test(z[i]) )
		tests[ _.strLeftBack(z[i], '.js') ] = require(path.join( __dirname, z[i] ) );


describe('Servidores',function(){
	describe('Prestart', function () {
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

			describe('Funciones Base', function(){
				var list = ['actio', 'master', 'lin', 'connect'];
				it('En objecto',function(){
					var x 	= require( GLOBAL.path.join(GLOBAL.dir, 'package.json' ) );
					GLOBAL.action	= require(GLOBAL.path.join(GLOBAL.dir, 'lib','action.js' ));
					GLOBAL.lib		= require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'index.js'));
					GLOBAL.connect	= require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'models' ));
					for (var i = list.length - 1; i >= 0; i--) {
						assert.equal(typeof GLOBAL[list[i]], 'Object' );
						
					};
					
				});
			});
	});
	describe('Start', test.run.server );
	
});