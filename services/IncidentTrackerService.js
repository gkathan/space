/**
 * incident tracker service
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

var _incidentTrackerCollection="incidenttracker";

exports.rebuildTracker = _rebuildTracker;
exports.incrementTracker = _incrementTracker;

exports.flushTracker = _flushTracker;
exports.weeklyTracker = _aggregateWeekly;
exports.monthlyTracker = _aggregateMonthly;
exports.findTrackerByDate = _findIncidenttrackerByDate;
exports.calculateDailyTracker = _calculateDailyTracker;
exports.initDailyTrackerForDay = _initDailyTrackerForDay
exports.buildStatistics = _buildStatistics;
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
* iterates over a given tracker
* and enriches by some more data
*/
function _buildStatistics(tracker,callback){
	var dateFields = ["openedAt","resolvedAt","closedAt"];

	var cumP01={"openedAt":0,"resolvedAt":0,"closedAt":0,"active":0,"notResolved":0};
	var cumP08={"openedAt":0,"resolvedAt":0,"closedAt":0,"active":0,"notResolved":0};
	var cumP16={"openedAt":0,"resolvedAt":0,"closedAt":0,"active":0,"notResolved":0};
	var cumP120={"openedAt":0,"resolvedAt":0,"closedAt":0,"active":0,"notResolved":0};

	for (var i in tracker){
			var _day = tracker[i];
			for (var d in dateFields){
				var dateField = dateFields[d];
				if (_day[dateField]){
					cumP01[dateField]+=_day[dateField].P01.total;
					cumP08[dateField]+=_day[dateField].P08.total;
					cumP16[dateField]+=_day[dateField].P16.total;
					cumP120[dateField]+=_day[dateField].P120.total;
					_day[dateField].P01.cumulative= cumP01[dateField];
					_day[dateField].P08.cumulative= cumP08[dateField];
					_day[dateField].P16.cumulative= cumP16[dateField];
					_day[dateField].P120.cumulative= cumP120[dateField];
				}
			}
			// is liek a burnrate => can be negative if i close more than i open ....
			var activeP01=_day.openedAt.P01.total-(_day.closedAt ? _day.closedAt.P01.total : 0) ;
			var activeP08=_day.openedAt.P08.total-(_day.closedAt ? _day.closedAt.P08.total : 0) ;
			var activeP16=_day.openedAt.P16.total-(_day.closedAt ? _day.closedAt.P16.total : 0) ;
			var activeP120=_day.openedAt.P120.total-(_day.closedAt ? _day.closedAt.P120.total : 0) ;

			if (!_day["active"]) _day["active"]={P01:0,P08:0,P16:0,P120:0};
			_day["active"].P01=activeP01;
			_day["active"].P08=activeP08;
			_day["active"].P16=activeP16;
			_day["active"].P120=activeP120;

			cumP01.notResolved+=_day.openedAt.P01.total-(_day.resolvedAt ? _day.resolvedAt.P01.total : 0);
			cumP08.notResolved+=_day.openedAt.P08.total-(_day.resolvedAt ? _day.resolvedAt.P08.total : 0);
			cumP16.notResolved+=_day.openedAt.P16.total-(_day.resolvedAt ? _day.resolvedAt.P16.total : 0);
			cumP120.notResolved+=_day.openedAt.P120.total-(_day.resolvedAt ? _day.resolvedAt.P120.total : 0);
	}
		var statistics = {sum:{P01:cumP01,P08:cumP08,P16:cumP16,P120:cumP120}};
	var result = {tracker:tracker,statistics:statistics};

	callback(null,result);
}

/**
* drops and rebuilds the according IncidentTracker collection
* iterates over all Incidents
* quite expensive call - so do that only when you really need it !!
*/
function _rebuildTracker(trackerTypes,callback){
	var _context = "bpty.studios";
	var incidentService = require('../services/IncidentService');
	incidentService.findAll({},function(err,incidents){
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


function _initDailyTrackerForDay(date,dateFields){
	var context = "bpty.studios";
	var _tracker = {"date":date,"context":context};

	for (var d in dateFields){
		//e.g. "openedAt"
		var _t =dateFields[d];
			_tracker[_t] = _initDailyTrackerItem();
	}
	return _tracker;
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
				//var _dayBefore =  new Date(moment(_day).substract(1, 'days').format("YYYY-MM-DD"));

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


				if (!_dayTracker[dateField]){
					_dayTracker[dateField]=_initDailyTrackerItem();
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
				// in case of update
				if (incidents[i].prioChange && dateField =="openedAt"){
					_.findWhere(_dailytracker,{"date":_day})[dateField][incidents[i].prioChange.old].total--;
				}
			}
			else{
				logger.info("[IncidentTrackerService._calculateDailyTracker()] says: "+dateField+" is not yet set.. so we can skip ");
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
* updates the incidentTracker
* first calculates daily tracker for given incidents list
* and then merges with already stored
* param incidents: list of NEW incidents
*/
function _incrementTracker(incidents,dateFields,callback){
	//var dateFields = ["openedAt","resolvedAt","closedAt"];
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
			if (result){
				logger.debug("*************** [FOUND] existing tracker for that day: "+JSON.stringify(result));
			}
			else{
				logger.debug("--------------- [NOPE] no tracker for that day: "+_tracker.date+" existing... ");
				// so lets create a new one ;-)
				result = _initDailyTrackerForDay(_tracker.date,["openedAt","resolvedAt","closedAt"]);
				logger.debug("--------------- [CREATED] empty tracker for that day: "+JSON.stringify(result));
			}
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



		//2015-01-01_2015-02-01
	if (_date.split("_").length==2){
			_from = new Date(_date.split("_")[0]);
			_to = new Date(_date.split("_")[1]);
	}
	//NOW-90 => 90 days back from now
	else if (_date.split("-")[0]=="NOW"){
		_from = new moment().subtract(_date.split("-")[1],'days').toDate();
		_to = new Date();
	}
	else if (_date=="ALL"){
		_from = new Date("2014-01-01");
		_to = new Date();
	}

	else if ( _year != NaN && _year >2010){
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

	/*
	// this would calculate dailytracker on demand =>> is at least 20xtimes slower !!!
	var _query = {openedAt : { $gte : _from,$lte : _to}};
	var incService = require('../services/IncidentService');
	incService.findFiltered(_query,function(err,incidents){
		_calculateDailyTracker(incidents,["openedAt","resolvedAt","closedAt"],"bpty.studios",function(err,success){
	*/

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
		//})
	})
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


/** helper method to convert a time string
*/
function getTimeName(time,dateString){
	var _timeName;
	// needs special treatment per time
	if (time=="week"){
		_timeName = "cw"+moment(dateString).format("WW")+"-"+moment(dateString).format("YYYY");
	}
	else if (time=="month"){
		_timeName = moment(dateString).format("MMMM")+"-"+moment(dateString).format("YYYY");
	}
	else if (time=="quarter"){
		_timeName = "Q"+moment(dateString).format("Q")+"-"+moment(dateString).format("YYYY");
	}
	else if (time=="halfyear"){
		var _half = parseInt((parseInt(moment(dateString).format("Q"))+1)/2);
		_timeName = "H"+_half+"-"+moment(dateString).format("YYYY");
	}
	else if (time=="year"){
		_timeName = moment(dateString).format("YYYY");
	}
	else if (time=="day"){
		_timeName = moment(dateString).format("YYYY-MM-DD");
	}
	return _timeName;
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
	var _item;
	var _timeName;

	var dateFields=["openedAt","resolvedAt","closedAt"];
	var subDimensions=["assignmentGroup","label","businessService"];
	var _prios = ["P01","P08","P16","P120"];

	// --- following code is quite complicated - but it got developed iterativly and optimized ;-)
  for (var i in data){
		_timeName = getTimeName(time,data[i].date);
		if (!_.findWhere(items,{"date":_timeName})){
			// init empty tracker data
			_item = {date:_timeName};
			for (var d in dateFields){
				// init the prios
				var _p={};
				for (var p in _prios){
					_p[_prios[p]]={total:0,assignmentGroup:{},label:{},businessService:{}};
				}
				_item[dateFields[d]]=_p;
			}
			items.push(_item);
		}

		for (var d in dateFields){
			var _dateField = dateFields[d];

			if (data[i][_dateField]){
				for (var p in _prios){
					var _prio = _prios[p];
					// _item is the existing openedAt
					_item = _.findWhere(items,{"date":_timeName})[_dateField][_prio];
					// now do the increments
					_item.total+=parseInt(data[i][_dateField][_prio].total);
					for (var s in subDimensions){
						var _sub=subDimensions[s];
						// the to be added items
						var _a = data[i][_dateField][_prio][_sub];
						for (var a in _.keys(_a)){
							//_.trim removes whitespaces at begin and end
							var _ag = _.trim(_.keys(_a)[a]);
							//logger.debug("++++++++++ assignmentGroup: "+_ag+" count: "+_a[_ag]);
							if (!_item[_sub][_ag]){
								_item[_sub][_ag]=_a[_ag];
							}
							else{
								_item[_sub][_ag]+=_a[_ag];
							}
						}
					}
				}
			}
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
