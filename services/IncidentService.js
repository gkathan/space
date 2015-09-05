/**
 * incident service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
var async = require("async");
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
var _oldIncidentsCollection="oldsnowincidents";
var _incidentsDeltaCollection="incidentsdelta";
var _incidentsActiveTickerCollection="incidentsactiveticker";


exports.find = _find;
exports.findById = _findById;

exports.findFiltered = _findFiltered;
exports.findAll = _findAll;
exports.findOld = _findOld;
exports.findProblem = _findProblem;
exports.findChangeLog = _findChangeLog;
exports.getLatestTicker = _getLatestTicker;
exports.flush = _flush;
exports.insert = _insert;
exports.update = _update;
exports.getKPIs = _getKPIs;
//exports.countKPITarget = _countKPITarget;

exports.saveDelta = _saveDelta;
exports.saveActiveTicker = _saveActiveTicker;
exports.mapPriority = _mapPriority;
exports.mapState = _mapState;
exports.getOverdueGroupedByAssignmentGroup = _getOverdueGroupedByAssignmentGroup;
exports.findRevenueImpactMapping = _findRevenueImpactMapping;
exports.flushAll = _flushAll;
exports.filterRelevantData = _filterRelevantData;
exports.calculateStats = _calculateStats;


/** loads all incidents from snow endpoint
* drops incidents collection
* and saves the newly fetched
* should only be called when really needed !!!!
*/
function _flushAll(prio,callback){
	var _url = config.sync["incidents"].url;
	var _type = "manual";
	var _secret = require("../config/secret.json");
	var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
	logger.debug("snowUser: "+_secret.snowUser);
	var Client = require('node-rest-client').Client;
	client = new Client(options_auth);
	// get all
	var _prio ;
	if (!prio) _prio = "<="+config.sync["incidents"].includePriority;
	else _prio = "="+prio;

	_url+="&sysparm_record_count=50000&sysparm_query=priority"+_prio;
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

function _findById(id,callback){
	_findFiltered({id:id},function (err,incidents){
		callback(err,incidents[0]);
	});
}

/**
 *
 */
function _find(filter,callback) {
	var items =  db.collection(_incidentsCollection);
	items.find(filter).sort({openedAt:-1}, function (err, docs){
			callback(err,docs);
			return;
	});
}

function _findOld(filter,callback) {
	var items =  db.collection(_oldIncidentsCollection);
	items.find(filter).sort({openedAt:-1}, function (err, docs){
			callback(err,docs);
			return;
	});
}


function _findProblem(incident,callback) {
	if (incident.problemId){
		var items =  db.collection('problems');
		items.findOne({id:incident.problemId}, function (err, problem){
				callback(err,problem);
				return;
		});
	}
	else{
		logger.debug("************************** No problem ???"+incident.problemId);
		callback(null,null);
	}
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

//finds all change entries for a given incident Id
function _findChangeLog(incidentId,callback){
	var delta =  db.collection(_incidentsDeltaCollection);
	delta.find({CHANGED:{$elemMatch:{id:incidentId}}},{CHANGED:1,createDate:1}, function (err, docs){
		if (err){
			logger.error("[error] "+err.message);
			callback(err);
			return;
		}
		logger.debug("in _findChangeLog: id= "+incidentId);
		logger.debug("docs.length = "+docs.length);
		var deltas = [];
		for (var d in docs){
			var _d = {changeDate:docs[d].createDate,change:_.findWhere(docs[d].CHANGED,{"id":incidentId}).diff};
			deltas.push(_d)
		}
		callback(err,deltas)
	})
}

/**
* drops and saves
*/
function _flush(data,callback){
	var items =  db.collection(_incidentsCollection);
	//items.drop();
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


function _calculateStats(callback){
	//	var _prios = _.pluck(config.mappings.snow.priority,"bpty");
	var _stats= {};
	var items =  db.collection(_incidentsCollection);
	items.find({active:"true",state:{$ne:"Resolved"}},function(err,incidents){
		_stats.totalOpen=incidents.length;
		_stats.P01Open = _.where(incidents,{priority:"P01 - Critical"}).length;
		_stats.P08Open = _.where(incidents,{priority:"P08 - High"}).length;
		_stats.P16Open = _.where(incidents,{priority:"P16 - Moderate"}).length;
		_stats.P120Open = _.where(incidents,{priority:"120 - Low"}).length;
		callback(null,_stats);
	})
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
*/
function _count(type,filter,callback){

	var incidents;
	if (type=="baseline") incidents =  db.collection(_oldIncidentsCollection);
	else if (type=="target") incidents =  db.collection(_incidentsCollection);
	incidents.find(filter).count(function (err, res) {
		if (err){
			logger.error("error: "+err.message);
		}
		callback(err,res);
	})
}



/**
helper
*/
function _getFromTo(range){
		var _from;
		var _to;
		if (range.length==2){
			_from = new Date(range[0]);
			_to = new Date(range[1]);
		}
		else if (range.length==1 && range[0].split("-")[0]=="NOW" ){
			_from = moment().subtract(range[0].split("-")[1], 'days').toDate();
			_to = new Date();
		}
		return {from:_from,to:_to};
}


function _calculateTotal(kpi,override){
	_.forIn(kpi,function(key,value){
		var _total = 0;
		_.forIn(kpi[value],function(_count,_state){
				_total+=_count;
		})
		logger.debug("key. "+	key);
		logger.debug("value. "+	value);
		kpi[value]["Total"]=_total;
		if (override){
				if (override[value]) kpi[value]["Total"]=override[value];
				logger.debug("************ OVERRIDE: "+override);
		}

	})
}

function _calculateTrends(baseline,target){
	var _prios = _.keys(baseline);
	var _states = _.keys(baseline[_prios[0]]);
	var _trends=[];

	for (var p in _prios){
		var _prio = _prios[p];
		for (var s in _states){
			var _state=_states[s];
			var _baseline = baseline[_prio][_state];

			var _trend = (-(1-(target[_prio][_state]/_baseline))*100).toFixed(1);
			if (isNaN(_trend)) _trend = 0;
			var _result = {prio:_prio,state:_state,trend:_trend};
			_trends.push(_result);
		}
	}
	return _trends;
}


/**
 * param baseline: type:"baseline",range:{from:date, to:date}
 */
function _getKPIs(baseline,target,callback){
	_countKPI(baseline.type,baseline.range,function(err,_baseline){
		_calculateTotal(_baseline.kpis,config.targets.kpis.incidents.baseline.totalsOverride);
		_countKPI(target.type,target.range,function(err,_target){
			_calculateTotal(_target.kpis,null);

			callback(err,{baseline:_baseline,target:_target,trends:_calculateTrends(_baseline.kpis,_target.kpis)});
		})
	})
}


/**
* calculates the KPI numbers by configured data
*/
function _countKPI(type,range,callback){
	var _config = config.targets.kpis.incidents[type];
	var _states = config.targets.kpis.incidents.states;
	var _priorities = config.targets.kpis.incidents.priorities;
	var _from = _getFromTo(range).from;
	var _to = _getFromTo(range).to;


	var _return = {kpis:{}};
	// init return
	for (var p in _priorities){
		_return.kpis[_priorities[p]]={};
		for (var s in _states){
			_return.kpis[_priorities[p]][_states[s]]=0;
		}
	}
	async.forEach(_priorities, function (_prio, done){
		// nested loop to go over all states
		async.forEach(_states,function(_state,doneState){
				var _filter = {priority:{$regex : _prio+".*"},openedAt:{$gte:_from,$lt:_to},state:_state,category:{$nin:_config.categoryExclude}};
				if (_config.businessServiceExclude){
					_filter.businessService={$not:/^Workplace/,$not:/^Kalixa/};
				}
				if (_config.labelExclude){
					//_filter.label={$not:/^Kalixa/};
				}
				_count(type,_filter,function(err,result){
					logger.debug("_prio: "+_prio+"...._state: "+_state+" : "+result);
					_return.kpis[_prio][_state]=result;
					doneState(); // tell async that the iterator has completed
				});
		},function(err){
			done();
		});
	}, function(err) {
	    if (err) console.log("error: "+err.message);
			_return.config=_config;
			callback(null,_return);
	});
}

/**
* insertsdelta
*/
function _getLatestTicker(callback){
	var ticker =  db.collection(_incidentsActiveTickerCollection);
	ticker.findOne({}, {sort:{$natural:-1}},function(err , success){
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
* save ticker
*/
function _saveActiveTicker(data,callback){
	var items =  db.collection(_incidentsActiveTickerCollection);
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
