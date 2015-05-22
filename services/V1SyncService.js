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

var _syncName = "v1epics";

exports.sync = _sync;

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] V1SyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode);
	if (config.sync[_syncName].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync V1 ....');
			var _type = "scheduled - automatic";
			_sync(config.sync[_syncName].url,_type,callback);
		});
	}
}




function _sync(url,type,callback){
	logger.debug("**** _syncV1Epics, url: "+url);

	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";


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
		var v1epics =  db.collection(_syncName);
		v1epics.drop();
		v1epics.insert({createDate:new Date(),epics:_epics}	 , function(err , success){
			//console.log('Response success '+success);
			if (err) {
				logger.error('Response error '+err.message);
			}
			if(success){
				var _message = "syncv1 [DONE]: "+_epics.length+" epics";
				logger.info(_message);

				app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:_epics.length+" epics",type:type});
				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
				callback(null,"syncv1 [DONE]: "+_epics.length+ " epics synced")
			}
			//return next(err);
		})
	}).on('error',function(err){
			var _message = err.message;
			logger.warn('[V1SyncService] says: something went wrong on the request', err.request.options,err.message);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
			callback(err);
	});
}
