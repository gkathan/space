var express = require('express');




var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var org = require('./routes/org');
var incidents = require('./routes/incidents');
var portfolio = require('./routes/portfolio');
var upload = require('./routes/upload');
var fs = require('fs')



// environment specific configurations
var config = require('config');


var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize:true, prettyPrint:true,showLevel:true,timestamp:true}),
      new (winston.transports.File)({ filename: 'logs/s2t.log' , prettyPrint:true,showLevel:true})
    ]
  });
logger.level='debug';




// load build number
var build = JSON.parse(fs.readFileSync('./s2t.build', 'utf8'));


if (config.env==="PRODUCTION") config.build=build.build;
//else config.build="---- development ----";

//config.build=build.build;


var app = express();




// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.locals.title="strategy2tactics";


app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));


//app.use(morgan('dev',{stream: accessLogStream}));
//app.use(logger('dev'));


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


// http://thenitai.com/2013/11/25/how-to-access-sessions-in-jade-template/
app.use(function(req,res,next){
	res.locals.session = req.session;
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
app.use('/org', org);
app.use('/users', users);
app.use('/upload', upload);
app.use('/portfolio', portfolio);
app.use('/incidents', incidents);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    logger.error("[not found] "+err);
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
    
    logger.fatal(err.status+" "+err.messag);
    
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


function _syncV1(url){
	// call v1 rest service
    var Client = require('node-rest-client').Client;
    
    var mongojs = require("mongojs");

	var DB="kanbanv2";

	var connection_string = '127.0.0.1:27017/'+DB;
	var db = mongojs(connection_string, [DB]);
 
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


