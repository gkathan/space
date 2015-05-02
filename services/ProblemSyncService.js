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
	rule.minute = new schedule.Range(0, 59, config.sync.problem.intervalMinutes);
	logger.info("[s p a c e] ProblemSyncService init(): "+config.sync.problem.intervalMinutes+" minutes - mode: "+config.sync.problem.mode);
	if (config.sync.problem.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Problem stuff ....');

			var _url = config.sync.problem.url;

			_syncProblem(_url,function(data){
				logger.debug("** [DONE] problemSync ");
			});

		});
	}
}

exports.sync = _syncProblem;

function _syncProblem(url,done){
	logger.debug("**** _syncProblem, url: "+url);

		var _secret = require("../config/secret.json");

		var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
		logger.debug("snowUser: "+_secret.snowUser);

		var Client = require('node-rest-client').Client;
		client = new Client(options_auth);
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
			var problems =  db.collection('problems');
			problems.drop();

			var _problems=[];
			for (var p in data.records){
				_problems.push(_filterRelevantData(data.records[p]));
			}

			problems.insert(_problems	 , function(err , success){
				//console.log('Response success '+success);
				logger.debug('Response error '+err);
				if(success){
					logger.info("[success] sync problems....length: "+_problems.length);
				}
			})
		done(data);
	}).on('error',function(err){
			logger.error('[ProblemSyncService] says: something went wrong on the request', err.request.options);
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
