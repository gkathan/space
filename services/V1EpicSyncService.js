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

var v1Service = require("../services/V1Service");

exports.sync = _sync;

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] V1EpicSyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode);
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

		_enrichEpics(_epics);

		v1epics.insert(_epics, function(err , success){
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
			logger.warn('[V1EpicSyncService] says: something went wrong on the request', err.request.options,err.message);
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
		epics[e].BusinessBacklogID = _parseObjectID(epics[e].BusinessBacklogID);

		epics[e].Product = v1Service.deriveProductFromBacklog(epics[e].BusinessBacklog);
	}

}
// eg {_oid\u003dScope:10461}
function _parseObjectID(name){
	var _id;
	_id =name.split("}")[0].split(":")[1];
	return _id;
}

/**
* takes a string of strategic theme from version1 and creates a proper object with datra
* e.g. "[[STR] G1 Push Mobile-First, [STR] G2 Execute Product Roadmap, [CUS] Bwin, [MAR] .es]"
*/
function _parseStrategicThemes(strategicThemeString){
	var strategicTheme = {customers:[],markets:[],targets:[]};
		// cut first and last bracket
	var _transform = _.initial(_.rest(strategicThemeString)).join("");
	_transform = _transform.split(",");

	for (var i in _transform){
		var _temp = _.trim(_transform[i]);
		if (_.startsWith(_temp,"[CUS]")) strategicTheme.customers.push(_.trim(_temp.split("[CUS]")[1]));
		else if (_.startsWith(_temp,"[MAR]")) strategicTheme.markets.push(_.trim(_temp.split("[MAR]")[1]));
		else if (_.startsWith(_temp,"[STR]")) strategicTheme.targets.push(_.trim(_temp.split("[STR]")[1]));
	}

	return strategicTheme;
}
