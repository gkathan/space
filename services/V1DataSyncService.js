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

var _syncName = "v1data";

var v1Service = require("../services/V1Service");

exports.sync = _sync;

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] V1DataSyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode);
	if (config.sync[_syncName].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync V1 Data ....');
			var _type = "scheduled - automatic";
			_sync(config.sync[_syncName].url,_type,callback);
		});
	}
}


function _sync(url,type,callback){
	logger.debug("**** _syncV1Data, url: "+url);

	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

  var Client = require('node-rest-client').Client;
	client = new Client();
	var _url = url[0];
	client.get(_url, function(data, response){
		var _data = JSON.parse(data);
		var _collection = "v1"+_.last(_url.split("/"));
		var v1data =  db.collection(_collection);
		v1data.drop();
		//_enrichEpics(_epics);
		v1data.insert(_data, function(err , success){
			//console.log('Response success '+success);
			if (err) {
				logger.error('Response error '+err.message);
			}
			if(success){
				var _message = "sync "+_collection+" [DONE]: "+_data.length+" items";
				logger.info(_message);
				app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:_message,type:type});
				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
				callback(null,"syncv1 [DONE]: "+_data.length+ " items synced")
			}
		})
	}).on('error',function(err){
			var _message = err.message;
			logger.warn('[V1DataSyncService] says: something went wrong on the request', err.request.options,err.message);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
			callback(err);
	});

}


function _enrichEpics(epics){
	for (var e in epics){
		var _strategicThemes = _parseStrategicThemes(epics[e].StrategicThemesNames);
		epics[e].Markets = _strategicThemes.markets;
		epics[e].Targets = _strategicThemes.targets;
		epics[e].Customers = _strategicThemes.customers;

		epics[e].Product = _deriveProduct(epics[e].BusinessBacklog);
	}

}
