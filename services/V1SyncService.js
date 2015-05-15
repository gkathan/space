var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

var app=require('../app');

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.sync = _sync;

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.v1Epics.intervalMinutes);
	logger.info("[s p a c e] V1SyncService init(): "+config.sync.v1Epics.intervalMinutes+" minutes - mode: "+config.sync.v1Epics.mode);
	if (config.sync.v1Epics.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync V1 ....');
			_sync(config.sync.v1Epics.url,function(err,result){
				logger.info("[v1EpicsSync]: "+result);
			});
		});
	}
}




function _sync(url,callback){
	// call v1 rest service
    var Client = require('node-rest-client').Client;
   client = new Client();
	// direct way
	client.get(url, function(data, response){
		// parsed response body as js object
		//console.log(data);
		// raw response
		//console.log(response);
		// and insert
		var _epics = JSON.parse(data);
		var v1epics =  db.collection('v1epics');
		v1epics.drop();
		v1epics.insert({createDate:new Date(),epics:_epics}	 , function(err , success){
			//console.log('Response success '+success);
			if (err) {
				logger.error('Response error '+err.message);
			}
			if(success){
				logger.info("syncv1 [DONE]");
				var _from = "v1Epics";
				app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_from,timestamp:new Date(),info:_epics.length+" epics"});
				callback(null,"syncv1 [DONE]: "+_epics.length+ " epics synced")


			}
			//return next(err);
		})
	}).on('error',function(err){
			logger.warn('[V1SyncService] says: something went wrong on the request', err.request.options,err.message);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:"v1Epics",timestamp:new Date(),info:err.message});
			callback(err);
	});
}
