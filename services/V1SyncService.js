var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');


exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.v1Epics.intervalMinutes);
	logger.info("[s p a c e] V1SyncService init(): "+config.sync.v1Epics.intervalMinutes+" minutes - mode: "+config.sync.v1Epics.mode);
	if (config.sync.v1Epics.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync V1 ....');
			_syncV1(config.sync.v1Epics.url);
		});
	}
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
	}).on('error',function(err){
			logger.warn('[V1SyncService] says: something went wrong on the request', err.request.options,err.message);
	});
}
