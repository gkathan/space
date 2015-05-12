/**
* syncs the SOC enriched incidents
*/

var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

us = require('underscore');
us.nst = require('underscore.nest');


var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.init = _init;
exports.sync=_syncSOCIncidents;



function _init(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.soc_incidents.intervalMinutes);
	logger.info("[s p a c e] SOCIncidentsSyncService init(): "+config.sync.soc_incidents.intervalMinutes+" minutes - mode: "+config.sync.soc_incidents.mode );
	if (config.sync.soc_incidents.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync SOCIncident stuff ....');
			var _url = config.sync.soc_incidents.url;
			_syncSOCIncidents(_url,callback);
		});
	}
}

function _syncSOCIncidents(url,callback){
	var async=require('async');
	var socIncidents;
	var incService = require('./IncidentService');
	async.series([
		function(done){
			logger.debug("1) ************************************** STEP-1");
			// call availability rest service
			var Client = require('node-rest-client').Client;
			client = new Client();

			// findAll grabs combined old and new snow incidents
			//if we only want new snow => for now just call find()
			incService.findAll(function(err,snowIncidents){
				// direct way
				client.get(url, function(data, response,callback){
					//logger.debug(data);
					socIncidents=JSON.parse(data);
					//logger.debug("------------------------"+socIncidents);
					// fix the date shit
					for (var d in socIncidents){
						var _incident = socIncidents[d];
						_incident.start = new Date(_incident.start);
						_incident.stop = new Date(_incident.stop);
						_incident.resolutionTime = _incident.stop - _incident.start;

						if (_incident.priority==" " && _.startsWith(_incident.incidentID,"Maintenance")) _incident.priority="MA";
						if (_incident.priority==" " && _.startsWith(_incident.incidentID,"CHG")) _incident.priority="CH";

						var _check = _.findWhere(snowIncidents,{"id":_incident.incidentID})
						if (_check){
							_incident.snowId = _check.sysId;
							_incident.labels = _check.label;
							_incident.businessService = _check.businessService;
						}
					}

					// and store it
					var socincidents =  db.collection('socincidents');
					socincidents.drop();
					socincidents.insert(socIncidents	 , function(err , success){
						//console.log('Response success '+success);
						logger.debug('Response error '+err);
						if(success){
							logger.info("sync soc_incidents [DONE]");
						}
					})
				}).on('error',function(err){
		        logger.error('[SOCIncidentSyncService] says: something went wrong on the request', err.request.options);
				})
		});
			done();
		},
		function(done){
					logger.debug("2) ************************************** STEP-2");
					// store
					done();
		}
		]);
		callback(socIncidents);
}
