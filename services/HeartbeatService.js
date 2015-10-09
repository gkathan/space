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
	var _url = config.heartbeat[name].url;
	var socketClient = require('socket.io-client')(_url);

	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	if (config.heartbeat[name].mode=="on"){
    logger.info("[s p a c e] HeartbeatService for: "+name+" init(): "+config.heartbeat[name].intervalMinutes+" minutes - mode: "+config.heartbeat[name].mode );
    rule.minute = new schedule.Range(0, 59, config.heartbeat[name].intervalMinutes);

    var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to heartbeat '+name+'  stuff ....');
			_heartbeat(name,socketClient,app,callback);
		});
    	_heartbeat(name,socketClient,app,callback);
  }
}


/**
* param name: type of collection
* param url: endpoint of REST data API to sync from
* param type: sync type to log (e.g. "API - manual" or "schedule - manual")
* param prepareData: function pointer to map / prepare data before save in local DB
* param callback
*/
function _heartbeat(name,socketClient,app,callback){
	var heartbeatData={};
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

  var heartbeatData={};
	heartbeatData.status="ERROR";
  heartbeatData.message="----";
	app.locals.heartbeat.spacesyncer=heartbeatData;

	socketClient.emit("heartbeat","ping from s p a c e ");

	socketClient.on("heartbeat",function(message){
		console.log(".....got HEARTBET back: "+message);
			heartbeatData.status="OK";
      heartbeatData.message="all fine";
      app.locals.heartbeat.spacesyncer=heartbeatData;
		});

}
