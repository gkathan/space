var express = require('express')

var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var mongojs = require("mongojs");
var fs = require('fs')
var config = require('config');

var app = express();

// passport stuff
var passport = require('passport'),
 LocalStrategy = require('passport-local');
var flash = require('connect-flash')



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

// db 
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);


// logger
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize:true, prettyPrint:true,showLevel:true,timestamp:true}),
      new (winston.transports.File)({ filename: 'logs/space.log' , prettyPrint:true,showLevel:true})
    ]
  });
logger.level='debug';

// load build number
var build = JSON.parse(fs.readFileSync('./space.build', 'utf8'));
if (config.env==="PRODUCTION") config.build=build.build;


// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.locals.title="s p a c e ";


// get all org instance dates for the menu
// ** this should go somewhere else ;-)
_getOrgDates(function(data){
	app.locals.organizationDates=data;
	console.log("** data: "+data);
});

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(bodyParser.json()); 
// limit 50m is for large svg POST data needed for transcoder
app.use(bodyParser.urlencoded({ extended: false ,limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());


// http://thenitai.com/2013/11/25/how-to-access-sessions-in-jade-template/
app.use(function(req,res,next){
	res.locals.session = req.session;

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
    }
    return next();
  });


// adds config object to all responses
var addconfig = require('./services/middleware/addconfig.js');
app.use(addconfig());

logger.debug("**** ENV: "+app.get('env'));
logger.info(path.join(__dirname,'public','images','favicon.ico'));
logger.debug("[CONFIG] "+JSON.stringify(config));



// should also go into some service class
// schedule v1sync
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();

// every 10 minutes
rule.minute = new schedule.Range(0, 59, config.v1.syncEpics.intervalMinutes);

if (config.v1.syncEpics.mode!="off"){
	var j = schedule.scheduleJob(rule, function(){
		logger.debug('...going to sync V1 ....');
		_syncV1(config.v1.syncEpics.url);
	});
}



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




/**
 * organization snapsho dates
 * => should be moved in a service class ;-)
 */
function _getOrgDates(callback){
   db.collection("organization").find({},{oDate:1}).sort({oDate:-1},function(err,data){
			callback(data);
	});
}

function _syncV1(url){
	// call v1 rest service
    var Client = require('node-rest-client').Client;
   client = new Client();
	// direct way 
	client.get(url, function(data, response){
		// parsed response body as js object 
		console.log(data);
		// raw response 
		console.log(response);
		// and insert 
		var v1epics =  db.collection('v1epics');
		v1epics.drop();
		v1epics.insert({createDate:new Date(),epics:JSON.parse(data)}	 , function(err , success){
			//console.log('Response success '+success);
			logger.debug('Response error '+err);
			if(success){
				logger.info("syncv1 [DONE]");
				
			}
			//return next(err);
		})
	});
}



module.exports = app;
