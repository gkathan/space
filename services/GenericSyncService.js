/**
* Generic Syncer
**/

var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

var app=require('../app');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.init = _init;
exports.sync=_sync;

function _init(name,callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[name].intervalMinutes);
	logger.info("[s p a c e] GenericSyncService for: "+name+" init(): "+config.sync[name].intervalMinutes+" minutes - mode: "+config.sync[name].mode );
	if (config.sync[name].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync '+name+'  stuff ....');
			var _url = config.sync[name].url;
			var _type = "scheduled - automatic";
			_sync(name,_url,_type,callback);
		});
	}
}


/**
* param name: type of collection
* param url: endpoint of REST data API to sync from
* param type: sync type to log (e.g. "API - manual" or "schedule - manual")
* param prepareData: function pointer to map / prepare data before save in local DB
* param callback
*/
function _sync(name,url,type,callback){

	var syncData={};

	var _syncStatus = require('./SyncService');
	var _syncName = name;
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";


	logger.debug("************************************** SYNC "+name);
	// call rest service
	var Client = require('node-rest-client').Client;
	var _options = {};
	if (config.proxy){
		_options.proxy = config.proxy;
		_options.proxy.tunnel=false;
	}
	client = new Client(_options);// direct way

	// direct way
	client.get(url, function(data, response,done){
		// parsed response body as js object
		logger.debug("...get data..: endpoint: "+url);

		try{
			syncData=JSON.parse(data);
		}
		catch(err){
			logger.error("[GenericSyncSerice] says: exception "+err);
			app.io.emit('syncUpdate', {status:_statusERROR,from:_syncName,timestamp:_timestamp,info:err.message,type:type});
			callback(err);
			return;
		}
		// and store it
		var _collection =  db.collection(name);
		_collection.drop();
		_collection.insert(syncData	 , function(err , success){
			//console.log('Response success '+success);
			if (err){
				var _message = '[GenericSyncSerice] says: something went wrong on the request: '+err.message;
				logger.debug(_message);
				app.io.emit('syncUpdate', {status:_statusERROR,from:_syncName,timestamp:_timestamp,info:err.message,type:type});

				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
				callback(null,syncData);
			}
			if(success){
				var _message = syncData.length+" "+name+" synced";
				logger.info("[GenericSyncSerice] says: sync "+name+" [DONE]");
				app.io.emit('syncUpdate', {status:_statusSUCCESS,from:_syncName,timestamp:_timestamp,info:_message,type:type});

				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
				callback(null,syncData);
			}
		})
	}).on('error',function(err){
      var _message = '[GenericSyncSerice] says: something went wrong on the request: '+err.message;
			logger.error(_message);
			app.io.emit('syncUpdate', {status:_statusERROR,from:_syncName,timestamp:_timestamp,info:err.message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
	});
}
