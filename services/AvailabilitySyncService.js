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

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.init = _init;
exports.sync=_syncAvailability;



function _init(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.availability.intervalMinutes);
	logger.info("[s p a c e] AvailabilitySyncService init(): "+config.sync.availability.intervalMinutes+" minutes - mode: "+config.sync.availability.mode );
	if (config.sync.availability.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Availability stuff ....');
			var _urls = config.sync.availability.url;
			_syncAvailability(_urls,callback);
		});
	}
}

function _syncAvailability(urls,callback){
	var async=require('async');
	var avData={};

	async.series([
		function(done){
					logger.debug("1) ************************************** STEP-1");
					// call availability rest service
					var Client = require('node-rest-client').Client;
					client = new Client();
					// direct way
					client.get(urls[0], function(data, response,callback){
						// parsed response body as js object
						var _endpoint = _.last(urls[0].split("/"));
						logger.debug("...get data..: endpoint: "+_endpoint);
						logger.debug(data);
						avData[_endpoint]=JSON.parse(data);
						// nested callback
						client.get(urls[1], function(data, response,callback){
							// parsed response body as js object
							var _endpoint = _.last(urls[1].split("/"));
							logger.debug("...get data..: endpoint: "+_endpoint);
							logger.debug(data);
							avData[_endpoint]=JSON.parse(data);

							client.get(urls[2], function(data, response,callback){
								// parsed response body as js object
								var _endpoint = _.last(_.initial(urls[2].split("/")));
								logger.debug("...get data..: endpoint: "+_endpoint);
								logger.debug(data);
								avData[_endpoint]=JSON.parse(data);
								// fix the date shit
								for (var d in avData[_endpoint]){
									var _incident = avData[_endpoint][d];
									_incident.start = new Date(_incident.start);
									_incident.stop = new Date(_incident.stop);

								}


								// and store it
								var availability =  db.collection('availability');
								availability.drop();
								availability.insert({createDate:new Date(),avReport:avData}	 , function(err , success){
									//console.log('Response success '+success);
									logger.debug('Response error '+err);
									if(success){
										logger.info("sync availability [DONE]");
									}
								})
							})
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
		callback(avData);
}
