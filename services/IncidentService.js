/**
 * incident service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
require('moment-duration-format');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');



/**
 *
 */
exports.find = function (callback) {
	var items =  db.collection('incidents');
	items.find({}).sort({openedAt:-1}, function (err, docs){
			callback(docs);
			return;
	});
}









/**
 * param prioritylist: ["P1","P8","P40"]
 *
 */
exports.findGroupedByPriority = function (prioritylist){
	var av = (100-parseFloat(avpercentageYTD))*100;
	console.log("av: "+av);
	var minutes = av*weeks;
	return moment.duration(minutes,'minutes').format("hh:mm.ss");;
}

exports.mapPriority = _mapPriority;
exports.mapState = _mapState;
exports.weeklyTracker = _aggregateWeekly;
exports.monthlyTracker = _aggregateMonthly;
exports.findTrackerByDate = _findIncidenttrackerByDate;



function _findIncidenttrackerByDate(grouping,period,callback){
  if (!grouping) grouping="weekly";


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

    db.collection(collection).find( _query, function(err , success){
        logger.debug('Response success '+success);
        logger.debug('Response error '+err);
        if(success){

						if (grouping=="weekly"){
							success = _aggregateWeekly(success);
						}
						else if (grouping=="monthly"){
							success = _aggregateMonthly(success);
						}
						else if (grouping=="quarterly"){
							success = _aggregateQuarterly(success);
						}
						// daily is default raw data - we have nothing todo
						//res.send(success);
            //return;
						logger.debug("************* callback success");
						callback(null,success);
        }
        callback(err);
    })

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

	var _factor =1;
	if (type=="halfyear") _factor=6;
	else if (type=="quarter") _factor=3;

	var splitted = period.split('-');
	var periodEndMonth =  splitted[0].charAt(1) * _factor;
	var periodStartMonth = (periodEndMonth - _factor)+1;
	var _start = moment(periodStartMonth + ' ' + splitted[1],'MM YYYY').format('YYYY-MM-DD');
	var _end = moment(periodEndMonth + ' ' + splitted[1],'MM YYYY').endOf('month').format('YYYY-MM-DD');

	logger.debug(" periodStartMonth= "+periodStartMonth +"periodEndMonth = "+periodEndMonth+ "splitted[1]"+splitted[1])
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

/*
function _parseWeek(week){
	return _parsePeriod(week,"week");
}
*/

/**
* parses a string to indiciate a week of a year and returns array with start end end date
* @param quarter: "W45-2014"
*/

function _parseWeek(week){
	var dateParsed;
	var _w = _.first(week);
	if (_w.toLowerCase()!="w") return false;

	var splitted = week.split('-');

	var _weekNumber = _.rest(splitted[0]);
	var _year = splitted[1];

	var _start = moment(_weekNumber+"-"+_year,"WW-YYYY").startOf('week').format('YYYY-MM-DD');;
	var _end = moment(_weekNumber+"-"+_year,"WW-YYYY").endOf('week').format('YYYY-MM-DD');;

	logger.debug("w start: "+_start);
	logger.debug("w end: "+_end);
	return [_start,_end];
}
/*
function _parsePeriod(period,type){
	var dateParsed;
	var _p = _.first(period);
	if (_p.toLowerCase()!=_.first(type)) return false;

	var _typeFormat ="";
	if (type=="week") _typeFormat="WW";
	else if (type=="month") _typeFormat="MM";
	else if (type=="quarter") _typeFormat="Q";



	var splitted = period.split('-');

	var _number = _.rest(splitted[0]);
	var _year = splitted[1];

	var _start = moment(_number+"-"+_year,_typeFormat+"-YYYY").startOf(type).format('YYYY-MM-DD');;
	var _end = moment(_number+"-"+_year,_typeFormat+"-YYYY").endOf(type).format('YYYY-MM-DD');;

	logger.debug("p start: "+_start);
	logger.debug("p end: "+_end);
	return [_start,_end];
}
*/

/** weekly incidenttracker data
* param period: defines whether we arte looking at "yearly",  "quarterly", "monthly", or "weekly"
*/
function _aggregateWeekly(data,period){
	// looking at week granularity does not make sense in monthly aggregation
	if (period=="daily"){
		return false;
	}

  var weeks =[];

	var _p1_week=0;
  var _p8_week=0;

  for (var i in data){
		var _week = moment(data[i].date).week();
		var _weekName = "cw"+moment(data[i].date).format("WW")+"-"+moment(data[i].date).format("YYYY");

  	if (!_.findWhere(weeks,{"date":_weekName})){
			_p1_week=0;
      _p8_week=0;
			weeks.push({P1:_p1_week,P8:_p8_week,date:_weekName});
			logger.debug("* week added: "+_week);
		}
		//console.log("_month: "+_month);
		_p1_week+=parseInt(data[i].P1);
    _p8_week+=parseInt(data[i].P8);

		_.findWhere(weeks,{"date":_weekName}).P1=_p1_week;
		_.findWhere(weeks,{"date":_weekName}).P8=_p8_week;
  }
	return weeks;
}


/** monthly incidenttracker data
* param period: defines whether we arte looking at "yearly",  "quarterly", "monthly", or "weekly"
*/
function _aggregateMonthly(data,period){
	// looking at week granularity does not make sense in monthly aggregation
	if (period=="weekly"||period=="daily"){
		return false;
	}

  var months =[];

	var _p1_month=0;
  var _p8_month=0;

  for (var i in data){
		var _month = moment(data[i].date).month();
		var _monthName = moment(data[i].date).format("MMMM")+"-"+moment(data[i].date).format("YYYY");

  	if (!_.findWhere(months,{"date":_monthName})){
			_p1_month=0;
      _p8_month=0;
			months.push({P1:_p1_month,P8:_p8_month,date:_monthName});
			logger.debug("* month added: "+_month);
		}
		//console.log("_month: "+_month);
		_p1_month+=parseInt(data[i].P1);
    _p8_month+=parseInt(data[i].P8);

		_.findWhere(months,{"date":_monthName}).P1=_p1_month;
		_.findWhere(months,{"date":_monthName}).P8=_p8_month;
  }
	return months;
}


/** quarterly incidenttracker data
* param period: defines whether we arte looking at "yearly",  "quarterly", "monthly", or "weekly"
*/
function _aggregateQuarterly(data,period){
	// looking at week granularity does not make sense in monthly aggregation
	if (period=="weekly" || period=="monthly" ||period=="daily"){
		return false;
	}

  var quarters =[];

	var _p1_quarter=0;
  var _p8_quarter=0;

  for (var i in data){
		var _quarter = moment(data[i].date).quarter();
		var _quarterName = "Q"+moment(data[i].date).format("Q")+"-"+moment(data[i].date).format("YYYY");

  	if (!_.findWhere(quarters,{"date":_quarterName})){
			_p1_quarter=0;
      _p8_quarter=0;
			quarters.push({P1:_p1_quarter,P8:_p8_quarter,date:_quarterName});
			logger.debug("* quarter added: "+_quarter);
		}
		//console.log("_month: "+_month);
		_p1_quarter+=parseInt(data[i].P1);
    _p8_quarter+=parseInt(data[i].P8);

		_.findWhere(quarters,{"date":_quarterName}).P1=_p1_quarter;
		_.findWhere(quarters,{"date":_quarterName}).P8=_p8_quarter;
  }
	return quarters;
}
