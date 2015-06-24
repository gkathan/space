/**
* service which syncs on a scheduled basis problems from snow
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

var _syncName = "problems";

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] ProblemSyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode);
	if (config.sync.problems.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Problem stuff ....');

			var _url = config.sync[_syncName].url;
			var _type = "scheduled - automatic";
			_syncProblem(_url,_type,callback);
		});
	}
}

exports.sync = _syncProblem;

function _syncProblem(url,type,callback){
	logger.debug("**** _syncProblem, url: "+url);

	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

	var _secret = require("../config/secret.json");

	var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
	logger.debug("snowUser: "+_secret.snowUser);

	var Client = require('node-rest-client').Client;
	client = new Client(options_auth);
	// direct way
	logger.debug("**** node rest client: "+client);
	//url+="priority<=3";
	logger.debug("*** client.get data : url = "+url);
	client.get(url, function(data, response,done){
		// parsed response body as js object
		logger.debug("...data:"+data);
		logger.debug("...response:"+response.records);

		logger.debug("arguments.callee.name: "+arguments.callee.name);
		logger.debug("[_syncProblem]...get data..: _url:"+url);
		//logger.debug("[_syncIncident]...get data..: data:"+JSON.stringify(data));

		// and store it
		var problems =  db.collection(_syncName);
		problems.drop();

		var _problems=[];
		for (var p in data.records){
			_problems.push(_filterRelevantData(data.records[p]));
		}

		problems.insert(_problems	 , function(err , success){
			//console.log('Response success '+success);
			if (err){
				var _message = '[ProblemSyncSerice] says: something went wrong on the request: '+err.message;
				logger.error(_message);
				app.io.emit('syncUpdate', {status:_statusERROR,from:_syncName,timestamp:_timestamp,info:err.message,type:type});

				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
				callback(null,result);
				return;

			}
			else if(success){
				var _message = "sync problems....length: "+_problems.length;
				logger.info(_message);
				app.io.emit('syncUpdate', {status:_statusSUCCESS,from:_syncName,timestamp:_timestamp,info:_problems.length+" items",type:type});

				_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);
				callback(err);
			}
		})

	}).on('error',function(err){
			var _message = '[ProblemSyncService] says: something went wrong on the request'+err.message;
			logger.error(_message, err.request.options);
			app.io.emit('syncUpdate', {status:_statusERROR,from:_syncName,timestamp:_timestamp,info:_message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
	})
}

/**
* filters out the relevant attributes of the 87 fields from snow ;-)
*/
function _filterRelevantData(data){

	var _problem={};
	_problem.location = data.location;
	_problem.context = "bpty";
	_problem.impact = data.impact;
	_problem.urgency = data.urgency;
	_problem.description = data.description;
	_problem.priority = data.priority;
	_problem.closedAt = data.closed_at;
	_problem.id = data.number;
	_problem.sysId = data.sys_id;

	_problem.workStart = data.work_start;
	_problem.slaResolutionDate = data.u_sla_resolution_due_date;
	_problem.category = data.category;
	_problem.labelType = data.u_label_type;
	_problem.active = data.active;
	_problem.closeCode = data.u_close_code;
	_problem.assignmentGroup = data.assignmentGroup;
	_problem.state = data.state;
	_problem.openedAt = data.opened_at;
	_problem.shortDescription = data.short_description;
	_problem.notify = data.notify;
	_problem.problemId = data.problem_id;
	_problem.severity = data.severity;
	_problem.isMajorIncident = data.u_major_incident;
	_problem.createdBy = data.sys_created_by;
	_problem.contactType = data.contact_type;
	_problem.timeWorked = data.time_worked;
	_problem.syncDate = new Date();

	return _problem;
}
