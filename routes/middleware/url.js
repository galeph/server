const min = /[_-]min/i;
const mes = /http(s)?\:/i;
const SSL_CDN = GLOBAL.CONFIG.response.ssl ? 's' : '';

/**
 * Contructor de nombre
 * @param  {String} types El tipo de informacion que entra
 * @param  {String} names El nombre del archiv
 * @return {string}       Coddificacion en base32
 */
function hash (types, names){
	var exists = GLOBAL.fs.statSync(__dirname);
	var hex = ( new Date( exists.mtime ) ).getTime() + '' ;
	hex += process.env.npm_package_version;
	return GLOBAL.lib.base['32'].encode(hex).substring(0,6);
}

/**
 * Contrustructor de direciones par archivos estaticos
 * @param  {String}  pat   Carpeta o archivo
 * @param  {Boolean} isLib Si pertenece a uan libreria
 * @return {String}        URL para hacer la peticion
 */
module.exports = function (pat, isLib){
	var cdns = url.parse( GLOBAL.CONFIG.response.cdn );

	delete cdns.url;
	delete cdns.search;
	delete cdns.href;

	cdns.query = {
		v : process.env.npm_package_version
	};
	var types = _.strRightBack( pat, '.');
	var has = hash(isLib ? 'lib' : types, pat.replace(min, '').split(/\.|\-/)[0] );

	if( types.length < 0 )
		return new Error('Not GLOBAL.path file');

	if( isLib ){
		var encode = new Buffer( _.strLeft(pat, '/'), 'utf8' );
		cdns.pathname = GLOBAL.path.join( 'lib', has  +'.'+ encode.toString('hex'), _.strRight(pat, '/') );
		return GLOBAL.url.format(cdns).replace(mes, 'http' + SSL_CDN + ':');
	} else {
		var paz = ( new Buffer( _.strLeft(pat, '.'), 'utf8' ) ).toString('hex');
		cdns.pathname = GLOBAL.path.join( types, has +'.'+ paz + '.' + types );
		return GLOBAL.url.format(cdns).replace(mes, 'http' + SSL_CDN + ':');
	}
};
