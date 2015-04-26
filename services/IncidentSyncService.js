/**
* service which syncs on a scheduled basis with the configured prioity  incidents from snow API
**/

var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');
var moment = require('moment');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

var jsondiffpatch=require('jsondiffpatch').create({
    // used to match objects when diffing arrays, by default only === operator is used
    objectHash: function(obj) {
        // this function is used only to when objects are not equal by ref
        return obj.id || obj.sysId;
    }});

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');


exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync.incident.intervalMinutes);
	logger.info("[s p a c e] IncidentSyncService init(): "+config.sync.incident.intervalMinutes+" minutes - mode: "+config.sync.incident.mode);
	if (config.sync.incident.mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Incident stuff ....');

			var _url = config.sync.incident.url;

			_syncIncident(_url,function(data){
				logger.debug("** [DONE] incidentSync ");
			});

		});
	}
}

exports.sync = _syncIncident;

function _syncIncident(url,done){
	logger.debug("**** _syncIncident, url: "+url);

		var _secret = require("../config/secret.json");

		var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
		logger.debug("snowUser: "+_secret.snowUser);

		var Client = require('node-rest-client').Client;
		client = new Client(options_auth);
		// direct way
		logger.debug("**** node rest client: "+client);

		/*
			Priority:
			Display Value	Actual Value
			P01 – Critical	1
			P08 – High	2
			P16 - Moderate	3
			P40 – Low	4
		*/
		url+="priority<="+config.sync.incident.includePriority;

		logger.debug("*** client.get data : url = "+url);


		client.get(url, function(data, response,callback){
			// parsed response body as js object
			logger.debug("...data:"+data);
			logger.debug("...response:"+response.records);

			logger.debug("arguments.callee.name: "+arguments.callee.name);
			logger.debug("[_syncIncident]...get data..: _url:"+url);
			//logger.debug("[_syncIncident]...get data..: data:"+JSON.stringify(data));

			var incidents =  db.collection('incidents');
			var incidentsdelta =  db.collection('incidentsdelta');


			// lets first get what we have had
			incidents.find({},function(err,baseline){

			// and store it

				incidents.drop();

				var _incidents=[];
				var _compareIncidents=[];
				var _compareIncidentsBaseline=[];

				for (var i in data.records){
					var _incident = _filterRelevantData(data.records[i]);
					_incidents.push(_incident);
					_compareIncidents.push(_filterRelevantDataForDiff(_incident));
				}

				for (var b in baseline){
					_compareIncidentsBaseline.push(_filterRelevantDataForDiff(baseline[b]));
				}


				// and do a diff with the new one
        // !! we need to iterate over the array and do the diff per incident!
        // and also check for new incidents !
        // lodash.difference
        // lodash.pick for reducing the object proerties
        // lodash.omit might be better...

        //todo

				var _diff = jsondiffpatch.diff(_compareIncidentsBaseline,_compareIncidents);
				// and send a websocket event about the changes ;-)

				logger.debug("--------------------------------------------------- baseline: length="+baseline.length);
				logger.debug("--------------------------------------------------- incidents: length="+_incidents.length);

				logger.debug("--------------------------------------------------- diff = "+JSON.stringify(_diff));

				incidentsdelta.insert(_diff);

				incidents.insert(_incidents	 , function(err , success){
					//console.log('Response success '+success);
					logger.debug('Response error '+err);
					if(success){
						logger.info("[success] sync incidents....length: "+_incidents.length);

							// get oldsnow data and merge it
							var incidenttrackeroldsnow =  db.collection('incidenttrackeroldsnow');
							incidenttrackeroldsnow.find({}, function(err , oldtrackerdata){

								if (oldtrackerdata){
									logger.debug("***** [yep] we got the old tracker data: length= "+oldtrackerdata.length);
									var _tracker = _calculateDailyTracker(_incidents,config.context);
									// and  handle incident tracker
									var incidenttracker =  db.collection('incidenttracker');
									incidenttracker.drop();
									incidenttracker.insert(oldtrackerdata.concat(_tracker)	 , function(err , success){
											if (err) logger.warn("[incidenttracker insert failed....]"+err.message);
											logger.info("[success] sync incidenttracker....length: "+_tracker.length);
									});

								}

							});

					}
				})
			})
			done(data);


		}).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
  });

}


/**
* filters out the relevant attributes of the 87 fields from snow ;-)
*/
function _filterRelevantDataForDiff(incident){
	//_id, _syncDate
	delete incident._id;
	delete incident.syncDate;

	return incident;
}


/**
* filters out the relevant attributes of the 87 fields from snow ;-)
*/
function _filterRelevantData(data){

	var _incident={};
	_incident.location = data.location;
	_incident.context="bpty";
	_incident.impact = data.impact;
	_incident.urgency = data.urgency;
	_incident.description = data.description;
	_incident.priority = data.priority;
	_incident.closedAt = new moment(data.closed_at,"DD-MM-YYYY HH:mm:ss").toDate();
	_incident.resolvedAt = new moment(data.resolved_at,"DD-MM-YYYY HH:mm:ss").toDate();
	_incident.id = data.number;
	_incident.sysId = data.sys_id;
	_incident.label = data.u_label;
	_incident.businessService = data.u_business_service;
	if(data.u_sla_resolution_due_date) _incident.slaResolutionDate = new moment(data.u_sla_resolution_due_date,"DD-MM-YYYY HH:mm:ss").toDate();
	_incident.category = data.category;
	_incident.labelType = data.u_label_type;
	_incident.active = data.active;
	_incident.closeCode = data.u_close_code;
	_incident.assignmentGroup = data.assignment_group;
	_incident.environment = data.u_environment;
	_incident.state = data.state;
	_incident.openedAt = new moment(data.opened_at,"DD-MM-YYYY HH:mm:ss").toDate();
	_incident.shortDescription = data.short_description;
	_incident.notify = data.notify;
	_incident.problemId = data.problem_id;
	_incident.severity = data.severity;
	_incident.isMajorIncident = data.u_major_incident;
	_incident.createdBy = data.sys_created_by;
	_incident.contactType = data.contact_type;
	_incident.timeWorked = data.time_worked;
	_incident.syncDate = new Date();
	_incident.slaBreach = "";
	_incident.slaBreachTime = "";

	//logger.debug("--------------------- state: "+data.state);
	if (data.state=="Resolved"){

		var _open = _incident.openedAt;
		var _resolved = _incident.resolvedAt


		var ms = moment(_resolved,"DD/MM/YYYY HH:mm:ss").diff(moment(_open,"DD/MM/YYYY HH:mm:ss"));
		var d = moment.duration(ms);
		var _time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");


		_incident.timeToResolve = _time;
		/*logger.debug("********************** opened: "+_open);
		logger.debug("********************** resolved: "+_resolved);
		logger.debug("********************** time to resolve: "+_time);
		*/
		if (_incident.slaResolutionDate && _resolved > _incident.slaResolutionDate){
			_incident.slaBreach = true;
			//logger.debug("################################## SLAB BREACH !!!! ");
			ms = moment(_resolved,"DD/MM/YYYY HH:mm:ss").diff(moment(_incident.slaResolutionDate,"DD/MM/YYYY HH:mm:ss"));
			d = moment.duration(ms);
			_time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

			//logger.debug("################################## SLAB BREACH by  "+_time);
			_incident.slaBreachTime = _time;
		}
		else if (_incident.slaResolutionDate && _resolved <= _incident.slaResolutionDate){
			_incident.slaBreach = false;
		}

	}

	return _incident;
}

function _getData(url,priority,date,callback){
		var Client = require('node-rest-client').Client;
		client = new Client();
		// direct way

		url+="priority<="+priority+"^opened_at>"+date;

		logger.debug("*** client.get data : url = "+url);


		client.get(url, function(data, response,callback){
			// parsed response body as js object
			logger.debug("...data:"+data);
			logger.debug("...response:"+response.records);

			logger.debug("...get data..: _url:"+url);
			callback(data);
		})
}


/**
* param data list of incident objects
* calculates the daily number of incidents types
* and updates the incidentracker collection
*/
function _calculateDailyTracker(data,context){
	var _dailytracker = [];
	for (var i in data){
		//openedAt date is what we look at
		var _day = moment(data[i].openedAt).format("YYYY-MM-DD");
		_day = new Date(_day);

		if (!_.findWhere(_dailytracker,{"date":_day})) {
			_dailytracker.push({"date":_day,"P1":0,"P8":0,"context":context});
		}

		if (data[i].priority=="P01 - Critical"){
			_.findWhere(_dailytracker,{"date":_day}).P1++;
		}
		else if (data[i].priority=="P08 - High"){
			_.findWhere(_dailytracker,{"date":_day}).P8++;
		}


	}
	return _dailytracker;
}
