var app = express();

_.extend(GLOBAL.CONFIG.servers.feed, lib.urlServer('feed'));

app.set('host-regex', GLOBAL.CONFIG.servers.feed.reg );
app.set('name', 'feed' ); //Dice que tipo de servidor es

app.set('views', path.join(__dirname, 'views')); //Direcion de las plantill
app = require('../middleware/params' )(app);
//TODO Top app.all('/top.:feed', require('./controller/top'));
app.use(require('./controller/feed'));
app.all('/:name(top|explore)?', require('./controller/all'));
app.all('/:apodo', require('./controller/profile'));

module.exports = require('../middleware/render')(app);
