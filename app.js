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

app.locals.heartbeat={};

var spaceServices=require('space.services');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

orgService = spaceServices.OrganizationService;
orgService.getOrganizationHistoryDates(function(err,data){
	app.locals.organizationhistoryDates=data;
 });


app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(bodyParser.json());
// limit 50m is for large svg POST data needed for transcoder
app.use(bodyParser.urlencoded({ extended: false ,limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public.bpty')));

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
  res.locals._=require('lodash');
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
var addconfig = require('./middlewares/addconfig.js');
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
app.use('/pinboards', scrumblr);

module.exports = app;

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


var heartbeatService = require('./services/HeartbeatService');
heartbeatService.init(app,"space.syncer",function(err,result){
  if (err){
    logger.error("[error]: "+err.message);
  }
  else{
    logger.info("heartbeatService.init() says: "+result);
  }
});


logger.info("[s p a c e] - app initializes DONE..");
