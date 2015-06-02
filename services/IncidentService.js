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
var _incidentTrackerCollection="incidenttracker";


exports.find = _find;
exports.findFiltered = _findFiltered;
exports.findAll = _findAll;
exports.findOld = _findOld;
exports.flush = _flush;
exports.insert = _insert;
exports.update = _update;
exports.rebuildTracker = _rebuildTracker;
exports.incrementTracker = _incrementTracker;
exports.rebuildCumulativeTrackerData = _rebuildCumulativeTrackerData;
exports.flushTracker = _flushTracker;
exports.saveDelta = _saveDelta;
exports.mapPriority = _mapPriority;
exports.mapState = _mapState;
exports.weeklyTracker = _aggregateWeekly;
exports.monthlyTracker = _aggregateMonthly;
exports.findTrackerByDate = _findIncidenttrackerByDate;
exports.getOverdueGroupedByAssignmentGroup = _getOverdueGroupedByAssignmentGroup;
exports.findRevenueImpactMapping = _findRevenueImpactMapping;
exports.calculateDailyTracker = _calculateDailyTracker;

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
	_url+="priority<="+config.sync["incidents"].includePriority;
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

function _update(data,callback){
	var items =  db.collection(_incidentsCollection);
	logger.debug("-------- about to update: "+data.length+" collections");
	logger.debug(JSON.stringify(data));
	items.update({},data, {multi:true})

}

/**
* drops and saves
*/
function _flushTracker(data,callback){
	var items =  db.collection(_incidentTrackerCollection);
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
	})
}

/**
* drops and rebuilds the according IncidentTracker collection
* iterates over all Incidents
* quite expensive call - so do that only when you really need it !!
*/
function _rebuildTracker(trackerTypes,callback){
	var _context = "bpty.studios";
	_findAll({},function(err,incidents){
		var dailyTracker = _calculateDailyTracker(incidents,trackerTypes,_context,function(err,tracker){
			logger.debug("done tracking..."+JSON.stringify(tracker));
			_flushTracker(tracker,function(err,result){
				if (err){
					logger.error("something bad happened: "+err.message);
					callback(err);
				}
				logger.debug("flushed tracker ");
				callback(null,"[rebuildTracker] for types: "+trackerTypes+" says: OK: ");
			})
		});
	})
}


function _initDailyTrackerItem(){
	return {
		"P01":{total:0,assignmentGroup:{},businessService:{},label:{}},
		"P08":{total:0,assignmentGroup:{},businessService:{},label:{}},
		"P16":{total:0,assignmentGroup:{},businessService:{},label:{}},
		"P120":{total:0,assignmentGroup:{},businessService:{},label:{}}
	};
}

/**
* param data list of incident objects
* calculates the daily number of incidents types
* and updates the incidentracker collection
* param incidents: list of incident objects
* param dateFields: array of types, sets which date field we should look at (e.g. "openedAt" to track new incidnets, "resolvedAt" track resolved incidents)
*/
function _calculateDailyTracker(incidents,dateFields,context,callback){
	var _dailytracker = [];
	//logger.debug("********* processing datefield: "+dateField);
	for (var i in incidents){
		//"openedAt" "resolvedAt" "closedAt"
		for (var d in dateFields){
			var dateField = dateFields[d];

			if (incidents[i][dateField]){
				var _day = moment(incidents[i][dateField]).format("YYYY-MM-DD");
				_day = new Date(_day);
				//logger.debug("** inc: "+incidents[i].id);
				var _priority=incidents[i].priority;
				//deburr cleans special characters
				var _assignmentGroup=_.deburr(incidents[i].assignmentGroup).split(".").join("_");
				var _businessService=_.deburr(incidents[i].businessService).split(".").join("_");
				var _labels=_.deburr(incidents[i].label).replace(", ",",").split(".").join("_").split(",");

				if (!_.findWhere(_dailytracker,{"date":_day})) {
					_dailytracker.push({"date":_day,"context":context});
				}

				var _dayTracker = _.findWhere(_dailytracker,{"date":_day});

				if (!_dayTracker[dateField])
				{
					_dayTracker[dateField]=_initDailyTrackerItem();
					/*
					{
						"P01":{total:0,assignmentGroup:{},businessService:{},label:{}},
						"P08":{total:0,assignmentGroup:{},businessService:{},label:{}},
						"P16":{total:0,assignmentGroup:{},businessService:{},label:{}},
						"P120":{total:0,assignmentGroup:{},businessService:{},label:{}}
					};
					*/
				}

				if (_.startsWith(_priority,"P01") || _.startsWith(_priority,"P04")){
					_.findWhere(_dailytracker,{"date":_day})[dateField].P01.total++;
					_handleAssignementGroup(_dailytracker,_day,dateField,"P01",_assignmentGroup);
					_handleBusinessService(_dailytracker,_day,dateField,"P01",_businessService);
					_handleLabel(_dailytracker,_day,dateField,"P01",_labels);
				}
				else if (_.startsWith(_priority,"P08")){
					_.findWhere(_dailytracker,{"date":_day})[dateField].P08.total++;
					_handleAssignementGroup(_dailytracker,_day,dateField,"P08",_assignmentGroup);
					_handleBusinessService(_dailytracker,_day,dateField,"P08",_businessService);
					_handleLabel(_dailytracker,_day,dateField,"P08",_labels);
				}
				else if (_.startsWith(_priority,"P16")){
					_.findWhere(_dailytracker,{"date":_day})[dateField].P16.total++;
					_handleAssignementGroup(_dailytracker,_day,dateField,"P16",_assignmentGroup);
					_handleBusinessService(_dailytracker,_day,dateField,"P16",_businessService);
					_handleLabel(_dailytracker,_day,dateField,"P16",_labels);
				}
				else if (_.startsWith(_priority,"P40") || _.startsWith(_priority,"P120")){
					_.findWhere(_dailytracker,{"date":_day})[dateField].P120.total++;
					_handleAssignementGroup(_dailytracker,_day,dateField,"P120",_assignmentGroup);
					_handleBusinessService(_dailytracker,_day,dateField,"P120",_businessService);
					_handleLabel(_dailytracker,_day,dateField,"P120",_labels);
				}
			}
			else{
				throw new Error(dateField+" is not an attribute of incidents..");
			}
		}//end for dateFIelds
	}//end for incidents
	callback(null,_dailytracker);
}

function _handleAssignementGroup(dailytracker,day,dateField,priority,assignmentGroup){
	if (!_.findWhere(dailytracker,{"date":day})[dateField][priority].assignmentGroup[assignmentGroup]){
		_.findWhere(dailytracker,{"date":day})[dateField][priority].assignmentGroup[assignmentGroup]=0;
	}
	_.findWhere(dailytracker,{"date":day})[dateField][priority].assignmentGroup[assignmentGroup]++;
}

function _handleBusinessService(dailytracker,day,dateField,priority,businessService){
	if (!_.findWhere(dailytracker,{"date":day})[dateField][priority].businessService[businessService]){
		_.findWhere(dailytracker,{"date":day})[dateField][priority].businessService[businessService]=0;
	}
	_.findWhere(dailytracker,{"date":day})[dateField][priority].businessService[businessService]++;
}

function _handleLabel(dailytracker,day,dateField,priority,labels){
	for (var i in labels){
		var label=labels[i];
		if (!_.findWhere(dailytracker,{"date":day})[dateField][priority].label[label]){
			_.findWhere(dailytracker,{"date":day})[dateField][priority].label[label]=0;
		}
		_.findWhere(dailytracker,{"date":day})[dateField][priority].label[label]++;
	}
}


/**
* calculates the daily cumulative difference between "open" and both "resolved" and "closed"
* needed for burndown charts
*/
function _rebuildCumulativeTrackerData(callback){
	var _context = "bpty.studios";
	// get all trackerdata
	var opened =  db.collection(_incidentTrackerCollection+"_openedAt");
	var resolved =  db.collection(_incidentTrackerCollection+"_resolvedAt");
	var closed =  db.collection(_incidentTrackerCollection+"_closedAt");

	opened.find().sort({date:1},function(err,dailyopened){
		resolved.find().sort({date:1},function(err,dailyresolved){
			closed.find().sort({date:1},function(err,dailyclosed){

				var P01OpenedSum=0;
				var P08OpenedSum=0;
				var P16OpenedSum=0;
				var P120OpenedSum=0;

				P01OpenedSum =_calculateCumulative(dailyopened,"P01");
				P08OpenedSum =_calculateCumulative(dailyopened,"P08");
				P16OpenedSum =_calculateCumulative(dailyopened,"P16");
				P120OpenedSum =_calculateCumulative(dailyopened,"P120");

				var P01ResolvedSum=0;
				var P08ResolvedSum=0;
				var P16ResolvedSum=0;
				var P120ResolvedSum=0;

				P01ResolvedSum =_calculateCumulative(dailyresolved,"P01");
				P08ResolvedSum =_calculateCumulative(dailyresolved,"P08");
				P16ResolvedSum =_calculateCumulative(dailyresolved,"P16");
				P120ResolvedSum =_calculateCumulative(dailyresolved,"P120");

				var P01ClosedSum=0;
				var P08ClosedSum=0;
				var P16ClosedSum=0;
				var P120ClosedSum=0;

				P01ClosedSum =_calculateCumulative(dailyclosed,"P01");
				P08ClosedSum =_calculateCumulative(dailyclosed,"P08");
				P16ClosedSum =_calculateCumulative(dailyclosed,"P16");
				P120ClosedSum =_calculateCumulative(dailyclosed,"P120");

				opened.drop();
				opened.insert(dailyopened);
				resolved.drop();
				resolved.insert(dailyopened);
				closed.drop();
				closed.insert(dailyopened);

				callback(null,{
					opened:{P01Sum:P01OpenedSum,P08Sum:P08OpenedSum,P16Sum:P16OpenedSum,P120Sum:P120OpenedSum},
					resolved:{P01Sum:P01ResolvedSum,P08Sum:P08ResolvedSum,P16Sum:P16ResolvedSum,P120Sum:P120ResolvedSum},
					closed:{P01Sum:P01ClosedSum,P08Sum:P08ClosedSum,P16Sum:P16ClosedSum,P120Sum:P120ClosedSum},
					openedminusresolved:{P01Diff:P01OpenedSum-P01ResolvedSum,P08Diff:P08OpenedSum-P08ResolvedSum,P16Diff:P16OpenedSum-P16ResolvedSum,P120Diff:P120OpenedSum-P120ResolvedSum},
					openedminusclosed:{P01Diff:P01OpenedSum-P01ClosedSum,P08Diff:P08OpenedSum-P08ClosedSum,P16Diff:P16OpenedSum-P16ClosedSum,P120Diff:P120OpenedSum-P120ClosedSum}
				});
			})
		})
	})
}

function _calculateCumulative(data,priority){
	var PSum=0;
	for (var o in data){
		PSum+=data[o][priority].total;
		var _prevDay = 0;
		if (data[o-1]) _prevDay = parseInt(data[o-1][priority].cum);
		data[o][priority].cum=parseInt(data[o][priority].total)+_prevDay;
	}
	return PSum;

}
/**
* updates the incidentTracker
* first calculates daily tracker for given incidents list
* and then merges with already stored
* param incidents: list of NEW incidents
*/
function _incrementTracker(incidents,callback){
	var dateFields = ["openedAt","resolvedAt","closedAt"];
	var context = "bpty.studios";
	_calculateDailyTracker(incidents,dateFields,context,function(err,tracker){
		//TODO merge with existing day if exists
		_saveDailyTracker(tracker,dateFields,function(err,result){
			if (result) callback(null,result);
			else callback(err);

		})

	})
}

function _saveDailyTracker(tracker,dateFields,callback){
	//iterate over days
	for (i in tracker){
		var _tracker = tracker[i];
		logger.debug("------------ _saveDailyTracker: "+_tracker.date);

		var items =  db.collection(_incidentTrackerCollection);
		// read tracker for that day
		items.findOne({date:_tracker.date},function(err,result){
			//logger.debug("*************** existing tracker for that day: "+JSON.stringify(result));

			// merge
			for (var d in dateFields){
				//e.g. "openedAt"
				var _t =dateFields[d];
				/*
				logger.debug("----------- _t: "+_t);
				logger.debug("----------- result[_t]: "+JSON.stringify(result[_t]));
				logger.debug("----------- result[_t].P01: "+result[_t]["P01"].total);
				logger.debug("----------- tracker[_t]: "+_tracker[_t]);
				logger.debug("----------- tracker[_t].P01: "+_tracker[_t]["P01"].total);
				*/

				// get all keys for _tracker[_t]
				for (var k in _.keys(_tracker[_t])){
					var _prio = _.keys(_tracker[_t])[k];
					// and per prio we look into the sub areas
					for (var i in _.keys(_tracker[_t][_prio])){
						var _att = _.keys(_tracker[_t][_prio])[i];
						var _count = _tracker[_t][_prio][_att];
						//check whether we have a number (total field)
						if (parseInt(_count)){
							logger.debug("++++ key: "+_att +" value: "+_tracker[_t][_prio][_att]);
							// increment according key in existing tracker
							var _increment = _tracker[_t][_prio][_att];


							if (result[_t]){
								if (result[_t][_prio][_att]){
									result[_t][_prio][_att]+=_increment;
								}
								else{
									result[_t][_prio][_att]=_increment;
								}
							}
							else{
								logger.info("no result[_t] for _t = "+_t+" ... so lets create an initiatl one...");
								result[_t]=_initDailyTrackerItem();
							}

						}
						else{
							logger.debug("_we need to go a bit deeper for: "+_att);
							for (var i in _.keys(_tracker[_t][_prio][_att])){
								var _sub = _.keys(_tracker[_t][_prio][_att])[i]
								logger.debug("++++++ key: "+_sub+ " - value: "+_tracker[_t][_prio][_att][_sub]);
								// increment according key in existing tracker
								var _increment = _tracker[_t][_prio][_att][_sub];
								// if this field exists - increment with calculated value

								if (result[_t]){
									if (result[_t][_prio][_att][_sub]){
										result[_t][_prio][_att][_sub]+=_increment;
									}
									// if this field not yet exists, just create and add the number
									else{
										result[_t][_prio][_att][_sub]=_increment;
									}
								}
								else{
									// no result[_t] yet => so lets create it
								logger.info("no result[_t] for _t = "+_t+" ... so lets create an initiatl one...");
									result[_t]=_initDailyTrackerItem();
								}


							}
						}
					}
				}
			}

			// and save
			//items.save(result);
			logger.debug("------------------------------------------------");
			logger.debug("------------------------------------------------");

			logger.debug("--- going to save: "+JSON.stringify(result));
			items.save(result,function(err,result){
				if (err) logger.error("save failed: +err.message");
				else logger.debug("save OK");

			});


			callback(null,result);



		})

	}

}
	/*
	var _day = moment(openedAt).format("YYYY-MM-DD");
	_day = new Date(_day);

	var _p01Increment = 0;
	var _p08Increment = 0;
	var _p16Increment = 0;
	var _p120Increment = 0;

	if (_.startsWith(priority,"P01") || _.startsWith(priority,"P04")) _p01Increment=1;
	else if (_.startsWith(priority,"P08")) _p08Increment=1;
	else if (_.startsWith(priority,"P16")) _p16Increment=1;
	else if (_.startsWith(priority,"P40") || _.startsWith(priority,"P120")) _p120Increment=1;


	var items =  db.collection(_incidentTrackerCollection+"_"+trackerType);
	items.findAndModify({query:{date: _day},update:{$inc:{'P01.total':_p01Increment,'P08.total':_p08Increment,'P16.total':_p16Increment,'P120.total':_p120Increment}},upsert:true},function(err,success){
		if (err){
			logger.error("IncidentService._incrementTracker("+trackerType+","+moment(openedAt).format('YYYY-MM-DD')+","+priority+" ) says: ERROR: "+err.message);
		}
		else {
			logger.debug("++++++++++++++++++++++ IncidentService._incrementTracker("+trackerType+","+moment(openedAt).format('YYYY-MM-DD')+","+priority+" ) says: increment by 1 = OK :-)");
		}
	});
*/



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
* param type: "openedAt", "resolvedAt" or "closedAt" are currently supported
*/
function _findIncidenttrackerByDate(aggregate,period,callback){
  if (!aggregate) aggregate="weekly";
	var collection = "incidenttracker";
	var _date = period;
	var _quarter = _parseQuarter(_date);
	var _half = _parseHalf(_date);
	var _month = _parseMonth(_date);
	var _week = _parseWeek(_date);

	logger.debug("------------------------ date: "+_date+" quarter: "+_quarter)
	logger.debug("------------------------ date: "+_date+" half: "+_half)
	logger.debug("------------------------ date: "+_date+" month: "+_month)
	logger.debug("------------------------ date: "+_date+" week: "+_week)


	// ok lets inspect what kind of date is specified
	// we support currently:
	// 1) just plain year "2015"
	// 2) quarter of a year "q1-2015"
	// 3) a day "2015-03-21"

  var _year = parseInt(_date);
	logger.debug("year:" +_year);
	var _from;
	var _to;

	if ( _year != NaN && _year >2010){
		_from = new Date(_date+"-01-01");
		_to = new Date(_date+"-12-31");
		logger.debug("[year]:" +_year+ "[from]: "+_from+" [to]: "+_to);
	}
	else if (_quarter){
		_from = new Date(_quarter[0]);
		_to = new Date(_quarter[1]);
		logger.debug("[quarter]:" +_quarter+ "[from]: "+_from+" [to]: "+_to);
	}
	else if (_half){
		_from = new Date(_half[0]);
		_to = new Date(_half[1]);
		logger.debug("[_half]:" +_half+ "[from]: "+_from+" [to]: "+_to);
	}
	else if (_month){
		_from = new Date(_month[0]);
		_to = new Date(_month[1]);
		logger.debug("[_month]:" +_month+ "[from]: "+_from+" [to]: "+_to);
	}
	else if (_week){
		_from = new Date(_week[0]);
		_to = new Date(_week[1]);
		logger.debug("[_week]:" +_week+ "[from]: "+_from+" [to]: "+_to);
	}
	else {
		logger.error("no way - no valid date specified");
	}
	logger.debug("findbyDate: value: "+_date);
	logger.debug("collection: "+collection);
 	var _query = {date : { $gte : _from,$lte : _to}};

  db.collection(collection).find( _query).sort({"date":1}, function(err , success){
    logger.debug('Response success '+success);
    logger.debug('Response error '+err);
    if(success){
			if (aggregate=="weekly"){
				success = _aggregateWeekly(success,period);
			}
			else if (aggregate=="monthly"){
				success = _aggregateMonthly(success,period);
			}
			else if (aggregate=="quarterly"){
				success = _aggregateQuarterly(success,period);
			}
			else if (aggregate=="halfyearly"){
				success = _aggregateHalfyearly(success,period);
			}
			else if (aggregate=="yearly"){
				success = _aggregateYearly(success,period);
			}
			else if (aggregate=="daily"){
				success = _aggregateDaily(success,period);
			}
			logger.debug("************* callback success");
			callback(null,success);
    }
    else{
			logger.warn("************* callback error: "+err.message);
			callback(err,null);
		}
	})
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
* generic parses a string to indiciate a given period of a year and returns array with start end end date
* @param quarter: "Q1-2014"
*/
function _parsePeriod(period,type){
	var dateParsed;
	var _p = _.first(period);
	if (_p.toLowerCase()!=_.first(type)) return false;

	var _typeFormat ="";
	if (type=="week") _typeFormat="WW";
	else if (type=="month") _typeFormat="MM";
	else if (type=="quarter") _typeFormat="Q";
	else if (type=="halfyear") _typeFormat="Q";

	var splitted = period.split('-');
	var _number = _.rest(splitted[0]);
	var _numberStart = _number;
	var _numberEnd = _number;
	// handling for halfyear - moment has no halfyaer implemented
	// so we take Q1+Q2 for H1
	// and Q3+Q4 for H2
	if (type=="halfyear"){
		_numberStart=(_number*2)-1;
		_numberEnd=(_number*2);
		type="quarter";
		logger.debug("*******HALFYEAR");
	}
	var _year = splitted[1];
	var _start = moment(_numberStart+"-"+_year,_typeFormat+"-YYYY").startOf(type).format('YYYY-MM-DD');;
	var _end = moment(_numberEnd+"-"+_year,_typeFormat+"-YYYY").endOf(type).format('YYYY-MM-DD');;
	logger.debug("p start: "+_start);
	logger.debug("p end: "+_end);
	return [_start,_end];
}


function _parseQuarter(quarter){
	return _parsePeriod(quarter,"quarter");
}

function _parseHalf(half){
	return _parsePeriod(half,"halfyear");
}

function _parseMonth(month){
	return _parsePeriod(month,"month");
}

function _parseWeek(week){
	return _parsePeriod(week,"week");
}

/** generic aggregator incidenttracker data
* param period: defines whether we arte looking at "yearly",  "quarterly", "monthly", or "weekly"
* param time: "week", "month", "quarter" "year"
*/
function _aggregateByTime(data,period,time){

	/* we need to consider now the different types which exist in data
	data.openedAt
	data.resolvedAt
	data.closedAt
	*/
	//weeks,months,....


	var items =[];
	var _p01_aggregate=0;
  var _p08_aggregate=0;
	var _p16_aggregate=0;
	var _p120_aggregate=0;

  for (var i in data){
		var _time;
		var _timeName;
		// needs special treatment per time
		if (time=="week"){
			_time = moment(data[i].date).week();
			_timeName = "cw"+moment(data[i].date).format("WW")+"-"+moment(data[i].date).format("YYYY");
		}
		else if (time=="month"){
			_time = moment(data[i].date).month();
			_timeName = moment(data[i].date).format("MMMM")+"-"+moment(data[i].date).format("YYYY");
		}
		else if (time=="quarter"){
			_time = moment(data[i].date).quarter();
			_timeName = "Q"+moment(data[i].date).format("Q")+"-"+moment(data[i].date).format("YYYY");
		}
		else if (time=="halfyear"){
			_time = moment(data[i].date).quarter();
			var _half = parseInt((parseInt(moment(data[i].date).format("Q"))+1)/2);
			_timeName = "H"+_half+"-"+moment(data[i].date).format("YYYY");
		}
		else if (time=="year"){
			_time = moment(data[i].date).year();
			_timeName = moment(data[i].date).format("YYYY");
		}
  	else if (time=="day"){
			_time = moment(data[i].date).day();
			_timeName = moment(data[i].date).format("YYYY-MM-DD");
		}
  	if (!_.findWhere(items,{"date":_timeName})){
			_p01_aggregate=0;
      _p08_aggregate=0;
			_p16_aggregate=0;
			_p120_aggregate=0;

			items.push({date:_timeName,
				"openedAt":{P01:{total:_p01_aggregate},P08:{total:_p08_aggregate},P16:{total:_p16_aggregate},P120:{total:_p120_aggregate}},
				"resolvedAt":{P01:{total:_p01_aggregate},P08:{total:_p08_aggregate},P16:{total:_p16_aggregate},P120:{total:_p120_aggregate}},
				"closedAt":{P01:{total:_p01_aggregate},P08:{total:_p08_aggregate},P16:{total:_p16_aggregate},P120:{total:_p120_aggregate}}
			});

		}

		if (data[i]["openedAt"]){
			_p01_aggregate+=parseInt(data[i]["openedAt"].P01.total);
	    _p08_aggregate+=parseInt(data[i]["openedAt"].P08.total);
			_p16_aggregate+=parseInt(data[i]["openedAt"].P16.total);
			_p120_aggregate+=parseInt(data[i]["openedAt"].P120.total);

			_.findWhere(items,{"date":_timeName})["openedAt"].P01.total=_p01_aggregate;
			_.findWhere(items,{"date":_timeName})["openedAt"].P08.total=_p08_aggregate;
			_.findWhere(items,{"date":_timeName})["openedAt"].P16.total=_p16_aggregate;
			_.findWhere(items,{"date":_timeName})["openedAt"].P120.total=_p120_aggregate;
		}

		if (data[i]["resolvedAt"]){
			_p01_aggregate+=parseInt(data[i]["resolvedAt"].P01.total);
	    _p08_aggregate+=parseInt(data[i]["resolvedAt"].P08.total);
			_p16_aggregate+=parseInt(data[i]["resolvedAt"].P16.total);
			_p120_aggregate+=parseInt(data[i]["resolvedAt"].P120.total);

			_.findWhere(items,{"date":_timeName})["resolvedAt"].P01.total=_p01_aggregate;
			_.findWhere(items,{"date":_timeName})["resolvedAt"].P08.total=_p08_aggregate;
			_.findWhere(items,{"date":_timeName})["resolvedAt"].P16.total=_p16_aggregate;
			_.findWhere(items,{"date":_timeName})["resolvedAt"].P120.total=_p120_aggregate;
		}

		if (data[i]["closedAt"]){
			_p01_aggregate+=parseInt(data[i]["closedAt"].P01.total);
	    _p08_aggregate+=parseInt(data[i]["closedAt"].P08.total);
			_p16_aggregate+=parseInt(data[i]["closedAt"].P16.total);
			_p120_aggregate+=parseInt(data[i]["closedAt"].P120.total);

			_.findWhere(items,{"date":_timeName})["closedAt"].P01.total=_p01_aggregate;
			_.findWhere(items,{"date":_timeName})["closedAt"].P08.total=_p08_aggregate;
			_.findWhere(items,{"date":_timeName})["closedAt"].P16.total=_p16_aggregate;
			_.findWhere(items,{"date":_timeName})["closedAt"].P120.total=_p120_aggregate;
		}


  }
	return {period:period,aggregate:time,tracker:items};
}



function _aggregateDaily(data,period){
		return _aggregateByTime(data,period,"day");
}


function _aggregateWeekly(data,period){
		return _aggregateByTime(data,period,"week");
}

function _aggregateMonthly(data,period){
		return _aggregateByTime(data,period,"month");
}

function _aggregateQuarterly(data,period){
		return _aggregateByTime(data,period,"quarter");
}

function _aggregateHalfyearly(data,period){
		return _aggregateByTime(data,period,"halfyear");
}

function _aggregateYearly(data,period){
		return _aggregateByTime(data,period,"year");
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

function _getTimeStringForTimeRange(start,stop){
	var ms = moment(stop,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
	var d = moment.duration(ms);
	var _time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
	return _time;
}
