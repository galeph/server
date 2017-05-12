const base32 = require('base32');
const network = /^(twitter|facebook|paypal|google)$/i;
const blocks = /^(about(s)?|abuse(s)?|account(s)?|addme(s)?|admin(s)?|advert(.*)|all(_)?advantage|america(_)?online(s)?|anal(_)?sex|android(s)?|animal(_)?sex|announce(s)?|anus(_)?lck|anuslick|apple(s)?|ass(_)?hole|ass(_)?lick|ass(_)?wipe(s)?|associate|ayuda(.*)|banner(s)?|bi(_)?dick(s)?|big(_)?cock|bigcock|bigdick(s)?|billing|bitch(s)?|bitcoin(.*)|blackberry|blogger(s)?|blow(_)?job(s)?|blow(_)?me(s)?|blow(_)?my|blowy|boob(s)?|buscar(s)?|butt(_)?fuck(.*)|butt(_)?lick|buttfuck(.*)|c(_)?(_)?n(_)?t|callback(s)?|campaign(.*)|career(s)?|chairman|change(s)?|check(s)?|child(_)?fck(.*)|child(_)?fuk(.*)|child(_)?porn(.*)|child(_)?rape(.*)|childrpe(.*)|chld(_)?fck(.*)|chldfck(.*)|chldfuk(.*)|cock(_)?lick(s)?|cock(_)?suck(s)?|comment(s)?|compusere|connect(s)?|create(s)?|credit(s)?|crime(s)?|cyberweb|daemon(s)?|debian|deparment(s)?|deploy|dev(s)?null|developers|development(s)?|dick(_)?head|dick(_)?les(s)?|dick(_)?lick|dick(_)?suck|dick(_)?wad|dickls(s)?|dicksuck|dicwad|dik(_)?nut|disconnect(s)?|distrib|ea(_)?my|eastiality|eat(_)?cock|eat(_)?pussy|eat(_)?shit|eatcock|eatmy(s)?|eatpussy|eatshit|embed(s)?|employ(s)?|engineer(s)?|enginer(s)?|entrar|executiv|f(_)?u(_)?c(_)?k|facebook|faggot(s)?|fck(_)?child(.*)|finance(s)?|firefox(s)?|follow(.*)?|forgot(s|ten)?|fuk(_)?child(.*)|fuk(_)?me(s)?|fuk(_)?u|fuk(_)?you(s)?|g(_)?l(_)?p(_)?h|gale(_)?ph|galeph|galeph|galph|gddamn|geocitie(s)?|gleph(s)?|goddamn|google(s)?|headquarter(s)?|hooter(s)?|hotmail|idfuk|igger|import(s)?|index(s)?|instant|intercourse|iphone(s)?|javascript|kd(_)?fck|kdfck|kid(_)?fuck|kid(_)?fuk|kid(_)?rape|kill(_)?jew(s)?|klljews|legal(s)?|licky(_)?my|linkedin|logging(s)?|login(s)?|logout(s)?|mail(s)?|market(s)?|member(s)?|messagemessenger|microsoft(s)?|mobil(.*)|money|msgin|net(_)?cop(p)?|net(_|c)?om|network(s)?|news(_)?letter(s)?|newsletter(s)?|niggah|niggr|nostro(s)?|office|opensearch|operator|oral(_)?sex|order(s)?|pass(_)?port|pass(_)?wd(s)?|pass(_)?word(s)?|passport(s)?|passw(_)?rd|passwd(s)?|password(s)?|passwordpass(_)?wrd(s)?|passwrd(s)?|paypal(.*)|penis|personnel|phuck|policie(s)?|postmpost(_)?m|president(s)?|privacy(s)?|problem(s)?|prodigy|promo(t|i|o|n)?|psswd(s)?|pussy(_)?lick|pussylick|recover(s)?|remove(s)?|retrieve|rim_job(s)?|rimjob(s)?|roots(s)?|sales(s)?|search(s)?|servc|service(.*)|setting(.*)|sffcei|shit(_)?ead|shit(_)?n|shithead|shiton|sign(_)?up(s)?|sobre(s)?|spammer(s)?|static(\_|\-)?site(.*)|statu(.*)|subscribe(.*)|suck(_)?cock|suck(_)?dick|suck(_)?my|suckcock(s)?|suckdick(s)?|suckits|suckmy(s)?|sucktits|superuser(s)?|supervisor(s)?|support(s)?|symbian(s)?|sys(_)?adm(s)?|system(s)?|telnet|term(s)?|tizen|twitter|ubuntu|uttlick|vagina(s)?|warez(s)?|wbadm|web(_)?adm(s)?|web(_)?maste(r)?(s)?|welfare|wellcome(s)?|whore|wikipedia|window(s)?|worker(s)?|world(_)?net(s)?)$/i;

exports.gateway = function () {
	return require('./gateway');
};

exports.maxCaracteres = function(number){
	return function (str){
		return str.length <= number;
	};
};

exports.testEmail = function (val) {
	var test = /^[a-z|0-9]{1}[a-z|0-9|.|_|-]{1,32}@[a-z|0-9|-]{1,15}(.(ac|ad|ae(ro)?|af|ag|ai|al|am|an|ao|aq|ar|as(ia)?|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi(z)?|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca(t)?|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co(m|op)?|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|edu|ee|eg|eh|er|es|et|eu(s)?|fi|fj|fk|fm|fo|fr|ga(l)?|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in(fo|t)?|io|iq|ir|is|it|je|jm|jo(bs)?|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo(bi)?|mp|mq|mr|ms|mt|mu(seum)?|mv|mw|mx|my|mz|na(me)?|nc|ne(t)?|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pr(o)?|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr(avel)?|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|yu|za|zm|zw)){1,2}$/.test( val );
	if (!test)
		return false;
	var maxs = {};
	var acc = _.strLeftBack(val, '@');
	for (var i = acc.length - 1; i >= 0; i--) {
		if( acc[i] === acc[i - 1] ){
			if( !maxs[ acc[i] ] )
				maxs[ acc[i] ] = 1;
			if( !/[a-z|0-9]/gim.test(acc[i]) )
				maxs[ acc[i] ] = maxs[ acc[i] ] + _.count(acc, acc[i] );
			if( /[a-z|0-9]/gim.test(acc[i]) )
				maxs[ acc[i] ]++;
			if( maxs[ acc[i + 1 ] ] >= 3 )
				maxs[ acc[i] ]++;
		}
	}

	return test && _.max(maxs) <= 4 && !blocks.test(acc);
};

exports.testName = function (val) {
	var reg1 = blocks.test( val );
	var reg2 = /^(login|recover|create)$/i.test( val );
	var reg3 = /\.|\\|\/|\@|\||\:/i.test(val);
	var reg4 = network.test( val );
	var reg5 = /^(?:contact|item|albums)$/i.test( val );

	if( reg1 && reg2 && reg3 && reg4 && reg5 )
		return false;

	var gateway = require('./gateway');

	return !gateway.payment(val);
};

exports.testPaysys = function (val) {
	var gateway = require('./gateway');
	return gateway.payment(val);
};

exports.testNetwork = function (val) {
	return network.test(val);
};

exports.urlServer = function(where){
	var curt = {
		protocol : 'http' + ( GLOBAL.CONFIG.response.ssl ? 's' : '' ),
		pathname : '/',
		hostname :  where + '.' + GLOBAL.CONFIG.servers[where].hostname
	};
	
	if(GLOBAL.CONFIG.response.port != 80)
		curt.port = GLOBAL.CONFIG.response.port;

	curt.reg = GLOBAL.CONFIG.servers[ where ].regexp ?
		new RegExp( curt.hostname.replace(where, GLOBAL.CONFIG.servers[ where ].regexp ) ) :
		curt.hostname;

	curt.url = url.format( curt );

	return curt;
};

exports.base = {
	'64' : {
		encode : function ( val ) {
			var val = _.isString(val) ? val : val.toString();
			return new Buffer( val, 'hex')
				.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
		},
		decode : function ( NoHex ) {
			return new Buffer( NoHex.replace(/\-/g,'+')
					.replace(/\_/g, '/'), 'base64').toString('hex');
		},
	},
	'32' : {
		encode : function ( val ) {
			return base32.encode( val.toString() );
		},
		decode : function (val) {
			return base32.decode( val.toString() );
		},
	}
};
