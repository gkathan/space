/**
 * incident service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
require('moment-duration-format');
_ = require('lodash');
_.nst=require('underscore.nest');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var _incidentsCollection="incidents";
var _incidentsDeltaCollection="incidentsdelta";


exports.find = _find;
exports.findFiltered = _findFiltered;
exports.findAll = _findAll;
exports.findOld = _findOld;
exports.flush = _flush;
exports.insert = _insert;
exports.update = _update;
exports.saveDelta = _saveDelta;
exports.mapPriority = _mapPriority;
exports.mapState = _mapState;
exports.getOverdueGroupedByAssignmentGroup = _getOverdueGroupedByAssignmentGroup;
exports.findRevenueImpactMapping = _findRevenueImpactMapping;
exports.flushAll = _flushAll;
exports.filterRelevantData = _filterRelevantData;


/** loads all incidents from snow endpoint
* drops incidents collection
* and saves the newly fetched
* should only be called when really needed !!!!
*/
function _flushAll(callback){
	var _url = config.sync["incidents"].url;
	var _type = "manual";
	var _secret = require("../config/secret.json");
	var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
	logger.debug("snowUser: "+_secret.snowUser);
	var Client = require('node-rest-client').Client;
	client = new Client(options_auth);
	// get all
	_url+="&sysparm_query=priority<="+config.sync["incidents"].includePriority;
	logger.debug("**** node rest client: "+_url);
	var _incidentsNEW=[];

	client.get(_url, function(data, response,done){
		logger.debug("-------------------------- in fetching....");

		_findRevenueImpactMapping(function(err,impactMapping){
			for (var i in data.records){
				var _incident = _filterRelevantData(data.records[i]);
				var _impact = _.findWhere(impactMapping,{"incident":data.records[i].number});
				if (_impact){
					 _incident.revenueImpact = parseInt(_impact.impact);
				}
				_incidentsNEW.push(_incident);
			}

			_flush(_incidentsNEW,function(err,result){
				if (err) logger.error("error: "+err.message);
				else logger.info("ok: "+result);
				callback(err,result);
			});
		})
	});
}

/**
 *
 */
function _findRevenueImpactMapping(callback) {
	var items =  db.collection('socincident2revenueimpact');
	items.find({},function (err, docs){
			callback(err,docs);
			return;
	});
}

function _findFiltered(filter,callback) {
	logger.debug("filter: "+JSON.stringify(filter));

	_findAll(filter, function (err, docs){
			if (err){
				logger.error("error: "+err.message);
			}
			//logger.debug("docs: "+docs)
			callback(err,docs);
			return;
	});
}

/**
 *
 */
function _find(callback) {
	var items =  db.collection(_incidentsCollection);
	items.find({}).sort({openedAt:-1}, function (err, docs){
			callback(err,docs);
			return;
	});
}

function _findOld(filter,callback) {
	var items =  db.collection('oldsnowincidents');
	items.find(filter).sort({openedAt:-1}, function (err, docs){
			callback(err,docs);
			return;
	});
}


/**
 * test find method which gets incidents transparently for caller from old and new snow repo
 */
function _findAll(filter,callback) {
	var items =  db.collection(_incidentsCollection);

	items.find(filter).sort({openedAt:-1}, function (err, incidents){
		var olditems =  db.collection('oldsnowincidents');
		if (err){
			callback(err);
			return;
		}
		logger.debug(".....findAll....incidents: "+incidents.length);
		//callback(err,incidents);
		olditems.find(filter).sort({openedAt:-1}, function (err, oldincidents){
			if (err) callback(err);
			logger.debug(".....findAll....oldincidents: "+oldincidents.length);
			var _all = _.union(incidents,oldincidents);
			callback(err,_all);
		});
	});
}

/**
* drops and saves
*/
function _flush(data,callback){
	var items =  db.collection(_incidentsCollection);
	items.drop();
	items.insert(data, function(err , success){
		if (err){
			callback(err);
			return;
		}
		else{
			callback(null,success);
			return;
		}
	});
}

/**
* saves
*/
function _insert(data,callback){
	var items =  db.collection(_incidentsCollection);
	logger.debug("-------- about to insert: "+data.length+" collections");
	items.insert(data, function(err,success){
		if (err){
			callback(err);
			return;
		}
		else{
			callback(null,success);
			return;
		}
	});
}

function _update(data){
	var items =  db.collection(_incidentsCollection);
	logger.debug("-------- about to save: "+data.length+" collections");
	//logger.debug(JSON.stringify(data));
	for (var i in data){
			items.save(data[i]);
	}

}


/**
* insertsdelta
*/
function _saveDelta(data,callback){
	var items =  db.collection(_incidentsDeltaCollection);
	items.insert(data, function(err , success){
		if (err){
			callback(err);
			return;
		}
		else{
			callback(null,success);
			return;
		}
	});
}

/**
 * param prioritylist: ["P01","P08","P40"]
 *
 */
exports.findGroupedByPriority = function (prioritylist){
	var av = (100-parseFloat(avpercentageYTD))*100;
	console.log("av: "+av);
	var minutes = av*weeks;
	return moment.duration(minutes,'minutes').format("hh:mm.ss");;
}


/**
* active ==true
* state != resolved,closed
* resolutionTime > SLA ?
* group by = AssignmentGroup
*/
function _getOverdueGroupedByAssignmentGroup(callback){
	_find(function(incidents){
		var result = _.nst.nest(incidents,("assignmentGroup"))
		callback(result);
	});
}


/**
* mapping of internal snow codes to bpty codes
*
*/
function _mapPriority(_prio){
	return _mapCode(_prio,"priority","bpty");
}

function _mapState(_state){
	return _mapCode(_state,"state","bpty");
}

function _mapCode(_code,_collection,_resolve){
	var _mapping = config.mappings.snow[_collection];
	var _lookup = _.findWhere(_mapping,{"sys":parseInt(_code)});
	if (_lookup)
		return _lookup[_resolve];
	else return false;
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

	if (data.priority){
		_incident.priority = data.priority;
	}
	else{
		if (_.startsWith(data.number,"CHG")) _incident.priority="CH";
		else if (_.startsWith(data.number,"Maintenance")) _incident.priority="MA";
	}

	if (data.closed_at !="") _incident.closedAt = new moment(data.closed_at,"DD-MM-YYYY HH:mm:ss").toDate();
	if (data.resolved_at !="") _incident.resolvedAt = new moment(data.resolved_at,"DD-MM-YYYY HH:mm:ss").toDate();
	if (data.u_sla_resolution_due_date !="") _incident.slaResolutionDate = new moment(data.u_sla_resolution_due_date,"DD-MM-YYYY HH:mm:ss").toDate();

	_incident.id = data.number;
	_incident.sysId = data.sys_id;
	_incident.label = data.u_label;
	_incident.businessService = data.u_business_service;
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
	_incident.subCategory = data.subcategory;

	// an do some enriching.....
	if (data.state=="Resolved" || data.state=="Closed"){
		var _open = _incident.openedAt;
		var _resolved = _incident.resolvedAt;
		_incident.timeToResolve = _getTimeStringForTimeRange(_open,_resolved);

		if (_incident.slaResolutionDate && _resolved > _incident.slaResolutionDate){
			_incident.slaBreach = true;
			//logger.debug("################################## SLAB BREACH by  "+_time);
			_incident.slaBreachTime = _getTimeStringForTimeRange(_incident.slaResolutionDate,_resolved);
		}
		else if (_incident.slaResolutionDate && _resolved <= _incident.slaResolutionDate){
			_incident.slaBreach = false;
		}
	}

	if (data.state=="Closed"){
		var _open = _incident.openedAt;
		var _closed = _incident.closedAt;
		_incident.timeToClose = _getTimeStringForTimeRange(_open,_closed);

		/*if (_incident.slaResolutionDate && _closed > _incident.slaResolutionDate){
			_incident.slaBreach = true;
			//logger.debug("################################## SLAB BREACH by  "+_time);
			_incident.slaBreachTime = _getTimeStringForTimeRange(_incident.slaResolutionDate,_closed);
		}
		else if (_incident.slaResolutionDate && _closed <= _incident.slaResolutionDate){
			_incident.slaBreach = false;
		}
		*/
	}
	return _incident;
}

// duplicated from SyncService !!!

function _getTimeStringForTimeRange(start,stop){
	var ms = moment(stop,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
	var d = moment.duration(ms);
	var _time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
	return _time;
}
