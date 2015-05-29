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
exports.rebuildTracker = _rebuildTracker;
exports.incrementTracker = _incrementTracker;

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

/*
function _findFiltered(filter,callback) {
	var items =  db.collection(_incidentsCollection);
	logger.debug("filter: "+JSON.stringify(filter));

	items.find(filter).sort({openedAt:-1}, function (err, docs){
			if (err){
				logger.error("error: "+err.message);
			}
			logger.debug("docs: "+docs)
			callback(err,docs);
			return;
	});
}
*/
function _findFiltered(filter,callback) {
	logger.debug("filter: "+JSON.stringify(filter));

	_findAll(filter, function (err, docs){
			if (err){
				logger.error("error: "+err.message);
			}
			logger.debug("docs: "+docs)
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
			//callback(err,incidents);
			//return;
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
* drops and saves
*/
function _flushTracker(data,trackerType,callback){
	var items =  db.collection(_incidentTrackerCollection+"_"+trackerType);
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
function _rebuildTracker(trackerType,callback){
	var _context = "bpty.studios";
	_findAll({},function(err,incidents){
		var dailyTracker = _calculateDailyTracker(incidents,trackerType,_context,function(err,tracker){
			logger.debug("done tracking..."+JSON.stringify(tracker));
			_flushTracker(tracker,trackerType,function(err,result){
				logger.debug("flushed tracker ");
				callback(null,"[rebuildTracker] for type: "+trackerType+" says: OK ");
			})
		});
	})
}


function _incrementTracker(trackerType,openedAt,priority){
	var _day = moment(openedAt).format("YYYY-MM-DD");
	_day = new Date(_day);

	var _p01Increment = 0;
	var _p08Increment = 0;
	var _p16Increment = 0;

	if (_.startsWith(priority,"P01")) _p01Increment=1;
	else if (_.startsWith(priority,"P08")) _p08Increment=1;
	else if (_.startsWith(priority,"P16")) _p16Increment=1;

	var items =  db.collection(_incidentTrackerCollection+"_"+trackerType);
	items.findAndModify({query:{date: _day},update:{$inc:{P01:_p01Increment,P08:_p08Increment,P16:_p16Increment}},upsert:true},function(err,success){
		if (err){
			logger.error("IncidentService._incrementTracker("+trackerType+","+moment(openedAt).format('YYYY-MM-DD')+","+priority+" ) says: ERROR: "+err.message);
		}
		else {
			logger.debug("++++++++++++++++++++++ IncidentService._incrementTracker("+trackerType+","+moment(openedAt).format('YYYY-MM-DD')+","+priority+" ) says: increment by 1 = OK :-)");
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
function _findIncidenttrackerByDate(aggregate,type,period,callback){
  if (!aggregate) aggregate="weekly";

	var collection = "incidenttracker"+"_"+type;
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
							success = _aggregateWeekly(success);
						}
						else if (aggregate=="monthly"){
							success = _aggregateMonthly(success);
						}
						else if (aggregate=="quarterly"){
							success = _aggregateQuarterly(success);
						}
						else if (aggregate=="halfyearly"){
							success = _aggregateHalfyearly(success);
						}

						else if (aggregate=="yearly"){
							success = _aggregateYearly(success);
						}

						// daily is default raw data - we have nothing todo
						//res.send(success);
            //return;
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




/**
* param data list of incident objects
* calculates the daily number of incidents types
* and updates the incidentracker collection
* param incidents: list of incident objects
* param dateField: sets which date field we should look at (e.g. "openedAt" to track new incidnets, "resolvedAt" track resolved incidents)
*/
function _calculateDailyTracker(incidents,dateField,context,callback){
	var _dailytracker = [];
	for (var i in incidents){
		//"openedAt" "resolvedAt" "closedAt"
		if (incidents[i][dateField]){
			//logger.debug("inc: "+incidents[i].id);
			var _day = moment(incidents[i][dateField]).format("YYYY-MM-DD");
			_day = new Date(_day);

			if (!_.findWhere(_dailytracker,{"date":_day})) {
				_dailytracker.push({"date":_day,"P01":0,"P08":0,"P16":0,"context":context});
			}

			if (incidents[i].priority=="P01 - Critical"){
				_.findWhere(_dailytracker,{"date":_day}).P01++;
			}
			else if (incidents[i].priority=="P08 - High"){
				_.findWhere(_dailytracker,{"date":_day}).P08++;
			}
			else if (incidents[i].priority=="P16 - Moderate"){
				_.findWhere(_dailytracker,{"date":_day}).P16++;
			}
		}
		else{
			throw new Error(dateField+" is not an attribute of incidents..");
		}
	}
	callback(null,_dailytracker);
}



/** generic aggregator incidenttracker data
* param period: defines whether we arte looking at "yearly",  "quarterly", "monthly", or "weekly"
* param time: "week", "month", "quarter" "year"
*/
function _aggregateByTime(data,period,time){
	// looking at week granularity does not make sense in monthly aggregation
	if (period=="daily"){
		return false;
	}

	//weeks,months,....
  var items =[];

	var _p01_aggregate=0;
  var _p08_aggregate=0;
	var _p16_aggregate=0;

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


  	if (!_.findWhere(items,{"date":_timeName})){
			_p01_aggregate=0;
      _p08_aggregate=0;
			_p16_aggregate=0;
			items.push({P01:_p01_aggregate,P08:_p08_aggregate,P16:_p16_aggregate,date:_timeName});
			logger.debug("* "+time+" added: "+_time);
		}

		_p01_aggregate+=parseInt(data[i].P01);
    _p08_aggregate+=parseInt(data[i].P08);
		_p16_aggregate+=parseInt(data[i].P16);

		_.findWhere(items,{"date":_timeName}).P01=_p01_aggregate;
		_.findWhere(items,{"date":_timeName}).P08=_p08_aggregate;
		_.findWhere(items,{"date":_timeName}).P16=_p16_aggregate;
  }
	return items;
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
