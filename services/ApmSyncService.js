/**
* service which syncs on a scheduled basis problems from snow
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
	rule.minute = new schedule.Range(0, 59, config.sync.apm.betplacement.intervalMinutes);
	logger.info("[s p a c e] ProblemSyncService init(): "+config.sync.problem.intervalMinutes+" minutes - mode: "+config.sync.apm.betplacement.mode);
	if (config.sync.apm.betplacement.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Problem stuff ....');

			var _conf = config.sync.apm.betplacement;
			var _url = _conf.url+"?"+"metricPath="+_conf.metricPath+"&time-range-type="+_conf.time-range-type+"&start-time="+_conf.start-time+"&end-time="+_conf.end-time;

			_syncBetPlacement(_url,function(data){
				logger.debug("** [DONE] apmSync ");
			});

		});
	}
}

exports.sync = _syncBetPlacement;

function _syncBetPlacement(url,done){
	logger.debug("---- in _syncBetPlacement...");
	var _conf = config.sync.apm.betplacement;
	logger.debug("---- _conf: "+_conf);
	var _url = "?"+"metric-path="+_conf.metricPath+"&time-range-type="+_conf.time_range_type+"&start-time="+_conf.start_time+"&end-time="+_conf.end_time+"&output=JSON";
	logger.debug("--------------------------------------- _url: "+_url);
	url+=_url;

	logger.debug("**** _syncBetPlacement, url: "+url);

		var _secret = require("../config/secret.json");

		var options_auth={user:_secret.apmUser,password:_secret.apmPassword};
		logger.debug("apmUser: "+_secret.apmUser);


		var Client = require('node-rest-client').Client;
		client = new Client();
		// direct way
		logger.debug("**** node rest client: "+client);

		//url+="priority<=3";

		logger.debug("*** client.get data : url = "+url);


		client.get(url, function(data, response,callback){
			// parsed response body as js object
			logger.debug("...data:"+data);
			logger.debug("...response:"+response.records);

			logger.debug("arguments.callee.name: "+arguments.callee.name);
			logger.debug("[_syncProblem]...get data..: _url:"+url);
			//logger.debug("[_syncIncident]...get data..: data:"+JSON.stringify(data));

			// and store it
			var qos =  db.collection('qos');
			qos.drop();


			qos.insert(data	 , function(err , success){
				//console.log('Response success '+success);
				logger.debug('Response error '+err);
				if(success){
					logger.info("[success] sync apm  ....length: "+data.length);

				}
			})
			done(data);


		})

}
