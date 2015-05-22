/**
* service which syncs on a scheduled basis with the availability reporting endpoint(s)
* 1) YTD
			http://avreport.bwin.intranet/API/AvReoprtingService.svc/getYTDDatapoint
*
	2) year per month list
			http://avreport.bwin.intranet/API/AvReoprtingService.svc/GetAVGraphDatapoints
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

var _syncName = "availability";

exports.init = _init;
exports.sync=_sync;

function _init(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] AvailabilitySyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode );
	if (config.sync[_syncName].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Availability stuff ....');
			var _urls = config.sync[_syncName].url;
			var _type = "scheduled - automatic";
			_sync(_urls,_type,callback);
		});
	}
}

function _sync(urls,type,callback){

	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

	var async=require('async');
	var avData={};

	logger.debug("************************************** SYNC AVAILABILITY");
	// call availability rest service
	var Client = require('node-rest-client').Client;
	client = new Client();
	// direct way
	client.get(urls[0], function(data, response,done){
		// parsed response body as js object
		var _endpoint = _.last(urls[0].split("/"));
		logger.debug("...get data..: endpoint: "+_endpoint);
		logger.debug(data);
		try{
			avData[_endpoint]=JSON.parse(data);
		}
		catch(err){
			logger.error("exception "+err);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:"availability",timestamp:new Date(),info:err.message,type:type});
			callback(err);
			return;
		}
		// nested callback
		client.get(urls[1], function(data, response,done){
			// parsed response body as js object
			var _endpoint = _.last(urls[1].split("/"));
			logger.debug("...get data..: endpoint: "+_endpoint);
			logger.debug(data);
			try{
				avData[_endpoint]=JSON.parse(data);
			}
			catch(err){
				logger.error("exception "+err);
				app.io.emit('syncUpdate', {status:"[ERROR]",from:"availability",timestamp:new Date(),info:err.message,type:type});
				_syncStatus.saveLastSync(_syncName,_timestamp,err.message,_statusERROR,type);
				callback(err);
				return;
			}
			// and store it
			var availability =  db.collection('availability');
			availability.drop();
			availability.insert({createDate:new Date(),avReport:avData}	 , function(err , success){
				//console.log('Response success '+success);
				if (err){
					logger.debug('Response error '+err.message);
					app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
					_syncStatus.saveLastSync(_syncName,_timestamp,err.message,_statusERROR,type);
					callback(err);
				}
				if(success){
					var _message = "AV Data synced";
					logger.info("sync availability [DONE]");
					_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
					app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:"avData synced",type:type});
					callback(null,avData);
				}
			})
		}).on('error',function(err){
        logger.error('[AvailabilitySyncSerice] says: something went wrong on the request', err.request.options);
				app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
				_syncStatus.saveLastSync(_syncName,_timestamp,err.message,_statusERROR,type);
			})
	}).on('error',function(err){
      logger.error('[AvailabilitySyncSerice] says: something went wrong on the request', err.request.options);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,err.message,_statusERROR,type);
	});
}
