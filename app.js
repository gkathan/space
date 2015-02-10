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

// environment specific configurations
var config = require('config');


var mail = require('./services/mail');
mail();




var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/kanbanv2.log', category: 'kanbanv2' }
    
  ],
  replaceConsole: true
});

var fs = require('fs')

var app = express();


// log4js
var logger = log4js.getLogger('kanbanv2');
logger.setLevel('TRACE');

logger.trace('**** Entering kanbanv2 log4js testing');
logger.debug('* kanbanv2 [debug] test');
logger.info('* kanbanv2 [info] test');
logger.warn('* kanbanv2 [warn] test');
logger.error('* kanbanv2 [error] test');
logger.fatal('* kanbanv2 [fatal] test');



// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.locals.title="kanbanv2 | strategy2tactics";


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


// adds config object to all responses
var addconfig = require('./services/middleware/addconfig.js');
app.use(addconfig());

console.log("**** ENV: "+app.get('env'));

logger.info(path.join(__dirname,'public','images','favicon.ico'));





console.log("[CONFIG] "+JSON.stringify(config));


// schedule v1sync
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();

// every 10 minutes
rule.minute = new schedule.Range(0, 59, config.v1.syncEpics.intervalMinutes);

if (config.v1.syncEpics.mode!="off"){
	var j = schedule.scheduleJob(rule, function(){
		console.log('...going to sync V1 ....');
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
					console.log('Response error '+err);
					if(success){
						console.log("syncv1 [DONE]");
						
					}
					//return next(err);
					
				})
	});

}


module.exports = app;


