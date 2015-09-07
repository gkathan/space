/**
* syncs the SOC enriched outages
*/

var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

us = require('underscore');
us.nst = require('underscore.nest');

var app=require('../app');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var _syncName = "soc_outages";

exports.init = _init;
exports.sync=_sync;



function _init(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] SOCOutagesSyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode );
	if (config.sync[_syncName].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync SOCOutages stuff ....');
			var _url = config.sync[_syncName].url;
			var _type = "scheduled - automatic";
			_sync(_url,_type,callback);
		});
	}
}

function _sync(url,type,callback){
	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";



	var socOutages;
	var incService = require('./IncidentService');

	var Client = require('node-rest-client').Client;
	var _options = {};
	if (config.proxy){
		_options.proxy = config.proxy;
		_options.proxy.tunnel=false;
	}
	client = new Client(_options);// direct way


	// findAll grabs combined old and new snow incidents
	//if we only want new snow => for now just call find()
	incService.findAll({},{openedAt:-1},function(err,snowIncidents){
		// direct way
		client.get(url, function(data, response,done){
			//logger.debug(data);
			try{
				socOutages=JSON.parse(data);
			}
			catch(err){
					logger.error('[SOCOutagesSyncService] Response error '+err);
					app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
					return;
			}
			//logger.debug("------------------------"+socOutages);
			// fix the date shit
			for (var d in socOutages){
				var _outage = socOutages[d];
				_outage.start = new Date(_outage.start);
				_outage.stop = new Date(_outage.stop);
				_outage.resolutionTime = _outage.stop - _outage.start;

				if (_outage.priority==" " && _.startsWith(_outage.incidentID,"Maintenance")) _outage.priority="MA";
				if (_outage.priority==" " && _.startsWith(_outage.incidentID,"CHG")) _outage.priority="CH";

				var _check = _.findWhere(snowIncidents,{"id":_outage.incidentID})
				if (_check){
					_outage.snowId = _check.sysId;
					_outage.labels = _check.label;
					_outage.businessService = _check.businessService;
					_outage.revenueImpact = _check.revenueImpact;
				}
			}

			// and store it
			var socoutages =  db.collection(_syncName);
			socoutages.drop();
			socoutages.insert(socOutages	 , function(err , success){
				if (err){
					var _message = err.message;
					logger.error('[SOCOutagesSyncService] Response error '+err);
					app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
					_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
				}
				if(success){
					var _message = "sync soc_outages [DONE]: "+socOutages.length+" items";
					logger.info(_message);
					app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:socOutages.length+" items",type:type});
					_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
					callback(null,socOutages);
				}

			})
		}).on('error',function(err){
        	var _message = err.message;
				logger.error('[SOCOutagesSyncService] says: something went wrong on the request', err.request.options);
				app.io.emit('syncUpdate', {status:"[ERROR]",from:_syncName,timestamp:_timestamp,info:err.message,type:type});
				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
		})
	})
}
