/**
* service which syncs on a scheduled basis with the P1, P8 incidents from snow API
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
	rule.minute = new schedule.Range(0, 59, config.sync.incident.intervalMinutes);
	logger.info("[s p a c e] IncidentSyncService init(): "+config.sync.incident.intervalMinutes+" minutes");
	if (config.sync.incident.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Incident stuff ....');

			var _url = config.sync.incident.url;

			_syncIncident(_url);

		});
	}
}


function _syncIncident(url){

/*
	// 1) fetch the data from the 2 endpoints
	async.each(urls, function (url, callback){
		// call availability rest service
		var Client = require('node-rest-client').Client;
		client = new Client();
		// direct way
		client.get(url, function(data, response){
			// parsed response body as js object

			logger.debug("...get data..");
			logger.debug(data);
		})
		callback();
	});
*/


	var async=require('async');

	async.series([
		function(callback){
					logger.debug("1) ************************************** STEP-1");
					_getData(url,1,"2015-03-25",function(data){
						logger.debug("-----------------------------------------data: "+data);
					})

					callback();
		},
		function(callback){
					logger.debug("2) ************************************** STEP-2");
					callback();
		}


		]);




		/*
		var availability =  db.collection('availability');
		availability.drop();
		availability.insert({createDate:new Date(),epics:JSON.parse(data)}	 , function(err , success){
			//console.log('Response success '+success);
			logger.debug('Response error '+err);
			if(success){
				logger.info("sync availability [DONE]");
			}
			//return next(err);

		})*/

}


function _getData(url,priority,date,callback){
		var Client = require('node-rest-client').Client;
		client = new Client();
		// direct way

		url+="u_priority="+priority+"^opened_at>"+date;

		client.get(url, function(data, response){
			// parsed response body as js object
			logger.debug("...data:"+data);
			logger.debug("...response:"+response);

			logger.debug("...get data..: _url:"+url);
			callback(data);
		})


}
