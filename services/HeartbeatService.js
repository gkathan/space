/**
* Generic Syncer
**/

var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');

var spaceServices = require('space.services');

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.init = _init;
exports.heartbeat=_heartbeat;

function _init(app,name,callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes


	if (config.heartbeat[name].mode=="on"){
    logger.info("[s p a c e] HeartbeatService for: "+name+" init(): "+config.heartbeat[name].intervalMinutes+" minutes - mode: "+config.heartbeat[name].mode );
    rule.minute = new schedule.Range(0, 59, config.heartbeat[name].intervalMinutes);
    var _url = config.heartbeat[name].url;
    var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to heartbeat '+name+'  stuff ....');
			_heartbeat(name,_url,app,callback);
		});
    	_heartbeat(name,_url,app,callback);
  }
}


/**
* param name: type of collection
* param url: endpoint of REST data API to sync from
* param type: sync type to log (e.g. "API - manual" or "schedule - manual")
* param prepareData: function pointer to map / prepare data before save in local DB
* param callback
*/
function _heartbeat(name,url,app,callback){
	var heartbeatData={};
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

	logger.debug("************************************** HEARTBEAT "+name+ " - checking: "+url);

  var request = require('request');
  request(url, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      logger.debug("URL is OK") // Print the google web page.
      heartbeatData.status="OK";
      heartbeatData.message="all fine with: "+url;
      app.locals.heartbeat.spacesyncer=heartbeatData;
      callback(null,heartbeatData)
    } else {
      logger.debug("ERROR: "+err.message);
      heartbeatData.status="ERROR";
      heartbeatData.message=err.message;
      app.locals.heartbeat.spacesyncer=heartbeatData;
      callback(null,heartbeatData)
    }
  })


}
