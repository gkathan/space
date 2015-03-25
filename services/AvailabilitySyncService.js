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


exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.availability.intervalMinutes);
	logger.info("[s p a c e] AvailabilitySyncService init(): "+config.sync.availability.intervalMinutes+" minutes");
	if (config.sync.availability.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Availability stuff ....');

			var _urls = config.sync.availability.url;

			_syncAvailability(_urls);

		});
	}
}



function _syncAvailability(urls){

	var avData={};


	var async=require('async');

	async.series([
		function(callback){
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
						avData[_endpoint]=data;
						// nested callback
						client.get(urls[1], function(data, response,callback){
							// parsed response body as js object
							var _endpoint = _.last(urls[1].split("/"));
							logger.debug("...get data..: endpoint: "+_endpoint);
							logger.debug(data);
							avData[_endpoint]=data;

							// and store it 
							var availability =  db.collection('availability');
							availability.drop();
							availability.insert({createDate:new Date(),avReport:avData}	 , function(err , success){
								//console.log('Response success '+success);
								logger.debug('Response error '+err);
								if(success){
									logger.info("sync availability [DONE]");
								}
								//return next(err);
							})
						})
				});
			callback();
		},
		function(callback){
					logger.debug("2) ************************************** STEP-2");
					// store
					callback();
		}


		]);






}
