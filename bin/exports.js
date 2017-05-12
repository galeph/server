#!/usr/bin/env node

GLOBAL.fs		= require('fs');
GLOBAL.url		= require('url');
GLOBAL.util		= require('util');
GLOBAL.path		= require('path');
GLOBAL.async	= require('async');
GLOBAL.moment	= require('moment');
GLOBAL._		= require('underscore');
GLOBAL._.str	= require('underscore.string');
GLOBAL.express	= require('express');

GLOBAL._.mixin(GLOBAL._.str.exports());
GLOBAL.dir      = path.join(__dirname, '..');

const acction = require('./acction');

GLOBAL.lib	   = require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'index.js'));
GLOBAL.connect = require(GLOBAL.path.join(GLOBAL.dir, 'lib', 'models', 'index.js' ));
GLOBAL.db	   = GLOBAL.connect.principal();

GLOBAL.async.waterfall([
	function (callback) {
		try{
			const pack = require('../package.json');
			process.env.npm_package_version = pack.version;
			process.title = process.env.npm_package_name = pack.name;
			callback(null, true);
		}catch(e){
			callback(e);
		}
	},
	function (is, callback) {
		acction.start({
			reset : false,
		},callback);
	}
],function (err) {
	if(err) console.error('Start', err);
	require('logbook').configure( GLOBAL.CONFIG.logger );
});