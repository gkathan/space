var express = require('express');
var winston = require('winston'),
  LogstashUDP = require('winston-logstash-udp').LogstashUDP;

var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongojs = require("mongojs");
var fs = require('fs');
var config = require('config');

// logger

var _loggerconfig;
if (config.env=="PRODUCTION") _loggerconfig = config.logger.production;
else _loggerconfig = config.logger.dev;

winston.loggers.add('space_log',_loggerconfig);



var logger = winston.loggers.get('space_log');



var app = express();


// passport stuff
var passport = require('passport'),
 LocalStrategy = require('passport-local');
var flash = require('connect-flash');

// routes
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var organization = require('./routes/organization');

var incidents = require('./routes/incidents');
var portfolio = require('./routes/portfolio');
var upload = require('./routes/upload');
var targets = require('./routes/targets');
var dashboard = require('./routes/dashboard');
var authenticate = require('./routes/authenticate');
var content = require('./routes/content');
var admin = require('./routes/admin');
var boards = require('./routes/boards');

var scrumblr = require('./routes/scrumblr');



logger.info("[s p a c e] - app initializes...");

// load build number
var build = JSON.parse(fs.readFileSync('./space.build', 'utf8'));
if (config.env==="PRODUCTION" ||config.env==="TEST" ) config.build=build.build;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.locals.title="s p a c e ";

orgService = require('./services/OrganizationService');
orgService.getOrganizationHistoryDates(function(err,data){
	app.locals.organizationhistoryDates=data;
 });


app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(bodyParser.json());
// limit 50m is for large svg POST data needed for transcoder
app.use(bodyParser.urlencoded({ extended: false ,limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',resave: false,saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// http://thenitai.com/2013/11/25/how-to-access-sessions-in-jade-template/
app.use(function(req,res,next){
	res.locals.session = req.session;
	res.locals.config = config;

	next();
});

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
  msg = req.session.notice,
  success = req.session.success;
  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;
  next();
});


// get access to URL of running app
app.use(function(req, res, next) {
    req.getBaseUrl = function() {
      return req.protocol + "://" + req.get('host');
    };
    return next();
  });


// adds config object to all responses
var addconfig = require('./services/middleware/addconfig.js');
app.use(addconfig());

logger.debug("**** ENV: "+app.get('env'));
logger.debug("[CONFIG] "+JSON.stringify(config));


app.use('/', routes);
app.use('/api', api);
app.use('/organization', organization);
app.use('/users', users);
app.use('/upload', upload);
app.use('/portfolio', portfolio);
app.use('/incidents', incidents);
app.use('/targets', targets);
app.use('/dashboard', dashboard);
app.use('/authenticate', authenticate);
app.use('/content', content);
app.use('/admin', admin);
app.use('/boards', boards);

app.use('/scrumblr', scrumblr);



var sockets=[];
app.io = require('socket.io')();

app.io.sockets.on('connection', function (socket) {
    logger.debug('[socket.io] says: new user connected!');

    socket.on('disconnect',function(){
      logger.debug("[socket.io] says: someone disconnected")
    })
});



// services

var v1EpicSyncService = require('./services/V1EpicSyncService');
v1EpicSyncService.init(function(err,result){
    if (err) logger.error("error: "+err.message);
    else logger.info("init ok: "+result);
});

var v1DataSyncService = require('./services/V1DataSyncService');
v1DataSyncService.init(function(err,result){
    if (err) logger.error("error: "+err.message);
    else logger.info("init ok: "+result);
});


var avSyncService = require('./services/AvailabilitySyncService');
avSyncService.init(function(err,av){
  if (err) logger.error("[error]: "+err.message);
  else logger.info("[ok]: "+JSON.stringify(av));
});

var incidentSyncService = require('./services/IncidentSyncService');
incidentSyncService.init(function(err,result){
  if (err){
    logger.error("[error]: "+err.message);
  }
  else{
    logger.info("IncidentSyncService.init() says: "+result);
  }
});

var soc_outagesSyncService = require('./services/SOCOutagesSyncService');
soc_outagesSyncService.init(function(err,data){
    if (err){
        logger.error("error: "+err.message);
    }
    else{
      logger.debug("soc_outagesSyncService.init() says: "+data.length+" items synced");
    }
});

var soc_servicesSyncService = require('./services/GenericSyncService');
soc_servicesSyncService.init("soc_services",function(err, data){
  if (err){
      logger.error("error: "+err.message);
  }
  else{
    logger.debug("soc_servicesSyncService.init() says: "+data.length+" items synced");
  }
});



var problemSyncService = require('./services/ProblemSyncService');
problemSyncService.init(function(err,result){
  if (err){
    logger.error("error: "+err.message);
  }
  else
  {
    logger.info("init ok: "+result);
  }
});

var apmSyncService = require('./services/ApmSyncService');
apmSyncService.init();


// https
// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');
// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.
app.use (function (req, res, next) {
	if (req.secure) {
		logger.debug("[ok] ssl call");
		// request was via https, so do no special handling
		next();
	} else {
		// request was via http, so redirect to https
		//logger.debug("[http] forwarding to ssl call"+ req.headers.host + req.url);
		res.redirect('https://' + req.headers.host+":3443" + req.url);
	}
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    logger.error(req.originalUrl+"[not found] "+err);
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            //logger.error("[message] "+err.message);
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    logger.error(err.status+" "+err.messag);

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
logger.info("[s p a c e] - app initializes DONE..");

module.exports = app;
exports.io = app.io;
















// ------------------------ SCRUMBLR SERVER --------------------------------
//exports.io_scrumbrl = app.io_scrumblr;

//var sockets=[];
//app.io_scrumblr = require('socket.io')();

var sanitizer = require('sanitizer');

var	rooms	= require('./services/scrumblr/rooms.js');
var	data	= require('./services/scrumblr/data.js').db;
//Map of sids to user_names
var sids_to_user_names = [];

/**************
 SOCKET.I0
**************/
app.io.sockets.on('connection', function (client) {
  console.log("******************** SCRUMBLER IO CONNECT !!!");
  //santizes text
	function scrub( text ) {
		if (typeof text != "undefined" && text !== null)
		{

			//clip the string if it is too long
			if (text.length > 65535)
			{
				text = text.substr(0,65535);
			}

			return sanitizer.sanitize(text);
		}
		else
		{
			return null;
		}
	}



	client.on('message', function( message ){
		//console.log(message.action + " -- " + sys.inspect(message.data) );

		var clean_data = {};
		var clean_message = {};
		var message_out = {};

		if (!message.action)	return;

		switch (message.action)
		{
			case 'initializeMe':
				initClient(client);
				break;

			case 'joinRoom':
				joinRoom(client, message.data, function(clients) {

						client.json.send( { action: 'roomAccept', data: '' } );

				});

				break;

			case 'moveCard':
				//report to all other browsers
				message_out = {
					action: message.action,
					data: {
						id: scrub(message.data.id),
						position: {
							left: scrub(message.data.position.left),
							top: scrub(message.data.position.top)
						}
					}
				};


				broadcastToRoom( client, message_out );

				// console.log("-----" + message.data.id);
				// console.log(JSON.stringify(message.data));

				getRoom(client, function(room) {
					db.cardSetXY( room , message.data.id, message.data.position.left, message.data.position.top);
				});

				break;

			case 'createCard':
				data = message.data;
				clean_data = {};
				clean_data.text = scrub(data.text);
				clean_data.id = scrub(data.id);
				clean_data.x = scrub(data.x);
				clean_data.y = scrub(data.y);
				clean_data.rot = scrub(data.rot);
				clean_data.colour = scrub(data.colour);

				getRoom(client, function(room) {
					createCard( room, clean_data.id, clean_data.text, clean_data.x, clean_data.y, clean_data.rot, clean_data.colour);
				});

				message_out = {
					action: 'createCard',
					data: clean_data
				};

				//report to all other browsers
				broadcastToRoom( client, message_out );
				break;

			case 'editCard':

				clean_data = {};
				clean_data.value = scrub(message.data.value);
				clean_data.id = scrub(message.data.id);

				//send update to database
				getRoom(client, function(room) {
					db.cardEdit( room , clean_data.id, clean_data.value );
				});

				message_out = {
					action: 'editCard',
					data: clean_data
				};

				broadcastToRoom(client, message_out);

				break;


			case 'deleteCard':
				clean_message = {
					action: 'deleteCard',
					data: { id: scrub(message.data.id) }
				};

				getRoom( client, function(room) {
					db.deleteCard ( room, clean_message.data.id );
				});

				//report to all other browsers
				broadcastToRoom( client, clean_message );

				break;

			case 'createColumn':
				clean_message = { data: scrub(message.data) };

				getRoom( client, function(room) {
					db.createColumn( room, clean_message.data, function() {} );
				});

				broadcastToRoom( client, clean_message );

				break;

			case 'deleteColumn':
				getRoom( client, function(room) {
					db.deleteColumn(room);
				});
				broadcastToRoom( client, { action: 'deleteColumn' } );

				break;

			case 'updateColumns':
				var columns = message.data;

				if (!(columns instanceof Array))
					break;

				var clean_columns = [];

				for (var i in columns)
				{
					clean_columns[i] = scrub( columns[i] );
				}
				getRoom( client, function(room) {
					db.setColumns( room, clean_columns );
				});

				broadcastToRoom( client, { action: 'updateColumns', data: clean_columns } );

				break;

			case 'changeTheme':
				clean_message = {};
				clean_message.data = scrub(message.data);

				getRoom( client, function(room) {
					db.setTheme( room, clean_message.data );
				});

				clean_message.action = 'changeTheme';

				broadcastToRoom( client, clean_message );
				break;

			case 'setUserName':
				clean_message = {};

				clean_message.data = scrub(message.data);

				setUserName(client, clean_message.data);

				var msg = {};
				msg.action = 'nameChangeAnnounce';
				msg.data = { sid: client.id, user_name: clean_message.data };
				broadcastToRoom( client, msg );
				break;

			case 'addSticker':
				var cardId = scrub(message.data.cardId);
				var stickerId = scrub(message.data.stickerId);

				getRoom(client, function(room) {
					db.addSticker( room , cardId, stickerId );
				});

				broadcastToRoom( client, { action: 'addSticker', data: { cardId: cardId, stickerId: stickerId }});
				break;

			case 'setBoardSize':
        var size = {};
				size.width = scrub(message.data.width);
				size.height = scrub(message.data.height);

				getRoom(client, function(room) {
					db.setBoardSize( room, size );
				});

        logger.debug("setBoardSize: "+size);

				broadcastToRoom( client, { action: 'setBoardSize', data: size } );
				break;

			default:
				//console.log('unknown action');
				break;
		}
	});

	client.on('disconnect', function() {
			leaveRoom(client);
	});

  //tell all others that someone has connected
  //client.broadcast('someone has connected');
});






/**************
 FUNCTIONS
**************/
function initClient ( client )
{
	console.log ('initClient Started');
	getRoom(client, function(room) {
    console.log("...ok: room: "+room);
		db.getAllCards( room , function (cards) {
      console.log("cards fetched...."+cards);
			client.json.send(
				{
					action: 'initCards',
					data: cards
				}
			);

		});


		db.getAllColumns ( room, function (columns) {
			client.json.send(
				{
					action: 'initColumns',
					data: columns
				}
			);
		});


		db.getTheme( room, function(theme) {

			if (theme === null) theme = 'bigcards';

			client.json.send(
				{
					action: 'changeTheme',
					data: theme
				}
			);
		});

		db.getBoardSize( room, function(size) {

			if (size !== null) {
				client.json.send(
					{
						action: 'setBoardSize',
						data: size
					}
				);
			}
		});

		roommates_clients = rooms.room_clients(room);
		roommates = [];

		var j = 0;
		for (var i in roommates_clients)
		{
			if (roommates_clients[i].id != client.id)
			{
				roommates[j] = {
					sid: roommates_clients[i].id,
					user_name:  sids_to_user_names[roommates_clients[i].id]
					};
				j++;
			}
		}

		//console.log('initialusers: ' + roommates);
		client.json.send(
			{
				action: 'initialUsers',
				data: roommates
			}
		);

	});
}


function joinRoom (client, room, successFunction)
{
	var msg = {};
	msg.action = 'join-announce';
	msg.data		= { sid: client.id, user_name: client.user_name };

	rooms.add_to_room_and_announce(client, room, msg);
	successFunction();
}

function leaveRoom (client)
{
	//console.log (client.id + ' just left');
	var msg = {};
	msg.action = 'leave-announce';
	msg.data	= { sid: client.id };
	rooms.remove_from_all_rooms_and_announce(client, msg);

	delete sids_to_user_names[client.id];
}

function broadcastToRoom ( client, message ) {
	rooms.broadcast_to_roommates(client, message);
}

//----------------CARD FUNCTIONS
function createCard( room, id, text, x, y, rot, colour ) {
	var card = {
		id: id,
		colour: colour,
		rot: rot,
		x: x,
		y: y,
		text: text,
		sticker: null
	};

	db.createCard(room, id, card);
}

function roundRand( max )
{
	return Math.floor(Math.random() * max);
}



//------------ROOM STUFF
// Get Room name for the given Session ID
function getRoom( client , callback )
{
	room = rooms.get_room( client );
	console.log( 'client: ' + client.id + " is in " + room);
	callback(room);
}


function setUserName ( client, name )
{
	client.user_name = name;
	sids_to_user_names[client.id] = name;
	//console.log('sids to user names: ');
	console.dir(sids_to_user_names);
}

function cleanAndInitializeDemoRoom()
{
	// DUMMY DATA
	db.clearRoom('/demo', function() {
		db.createColumn( '/demo', 'Not Started' );
		db.createColumn( '/demo', 'Started' );
		db.createColumn( '/demo', 'Testing' );
		db.createColumn( '/demo', 'Review' );
		db.createColumn( '/demo', 'Complete' );


		createCard('/demo', 'card1', 'Hello this is fun', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'yellow');
		createCard('/demo', 'card2', 'Hello this is a new story.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'white');
		createCard('/demo', 'card3', '.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'blue');
		createCard('/demo', 'card4', '.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'green');

		createCard('/demo', 'card5', 'Hello this is fun', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'yellow');
		createCard('/demo', 'card6', 'Hello this is a new card.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'yellow');
		createCard('/demo', 'card7', '.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'blue');
		createCard('/demo', 'card8', '.', roundRand(600), roundRand(300), Math.random() * 10 - 5, 'green');
	});
}
//

/**************
 SETUP DATABASE ON FIRST RUN
**************/
// (runs only once on startup)
var db = new data(function() {
	cleanAndInitializeDemoRoom();
});
