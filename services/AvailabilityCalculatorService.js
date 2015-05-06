/**
 *
 *
 * .....
 */
var config = require('config');
var mongojs = require('mongojs');
var _ = require('lodash');
var moment = require('moment');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');
/**
 *
 */
exports.calculateOverall = _calculateOverall;
exports.calculateExternal = _calculateExternal;
exports.checkCoreTime = _checkCoreTime;


/**
* calculation orchestrator for OVERALL
**/
function _calculateOverall(from, to, done){
	var avService=require('./AvailabilityService');
	//first we grab the external services as we need them to calculate the "ProductIntegration" service
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,function(data){
			// the result of this will be injected as "ProductIntegration row in MAIN "
			var _injectServices = [];
			var _productIntegration={ServiceName:"Product Integration",ext_service:0,ServiceGroupID:1,Report:1,CoreService:1,Highlight:0,availability:{planned:data.avPlanned,unplanned:data.avUnplanned,total:data.avTotal,plannedTime:data.cumPlanned,unplannedTime:data.cumUnplanned,totalTime:data.cumTotal}};
			_injectServices.push(_productIntegration);
			avService.findSOCServicesMain(function(servicesMain){
				_processServices("MAIN",servicesMain,_injectServices,from,to,function(data){
				//callback
				done(data);
				});
			})
		});
	})
}

/**
* calculation orchestrator for EXTERNAL ONLY
**/
function _calculateExternal(from, to, done){
	var avService=require('./AvailabilityService');
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,function(data){
			done(data);
		});
	})
}

/**
* param injectedServices: to include calculated stuff from other rounds (legacy need to get this ProductInetgration ...)
**/
function _processServices(type,services,injectedServices,from,to,callback){
		var totalTime = new Date(to)-new Date(from);
		var _socIncidents = db.collection('socincidents');
		_socIncidents.find(function(err,data){
		// grab the SOC incidents for the intervall (from to)
		var cumPlanned = 0.0;
		var cumPlannedCore = 0.0;
		var cumPlannedNonCore = 0.0;

		var cumUnPlanned = 0.0;
		var cumUnPlannedCore = 0.0;
		var cumUnPlannedNonCore = 0.0;

		var cumTotalCore = 0.0;
		var cumTotalNonCore = 0.0;


		var incidentsPlanned = [];
		var incidentsUnplanned = [];
		//iterate over all services
		for (var s in services){
			var servicePlanned = 0.0;
			var serviceUnplanned = 0.0;
			//per service iterate over incidents
			for (var i in data){
				var _inc = data[i];
				if (_inc.serviceName.split(",").indexOf(services[s].ServiceName)>-1 &&_inc.isEndUserDown && _inc.start>=new Date(from) && _inc.start <=new Date(to)){
					var _time = _degrade(_inc.resolutionTime,_inc.degradation);
					if (_inc.isPlanned==true){
						// check core / non-core

						_checkCoreTime(_inc,function(result){
							cumPlanned+=_time;
							cumPlannedCore+=result.coreTime;
							cumPlannedNonCore+=result.nonCoreTime;

							servicePlanned+=_time;
							incidentsPlanned.push(_inc);
						})


					}
					else{
						// check core / non-core
						_checkCoreTime(_inc,function(result){
							cumUnPlanned+=_time;
							cumUnPlannedCore+=result.coreTime;
							cumUnPlannedNonCore+=result.nonCoreTime;

							serviceUnplanned+=_time;
							incidentsUnplanned.push(_inc);

						})

						cumTotalCore=cumUnPlannedCore+cumPlannedCore;
						cumTotalNonCore=cumUnPlannedNonCore+cumPlannedNonCore;

					}
				}
			}
			var avServicePlanned = 1-(servicePlanned / totalTime);
			var avServicePlannedCore = 1-(cumPlannedCore / totalTime);
			var avServicePlannedNonCore = 1-(cumPlannedNonCore / totalTime);

			var avServiceUnplanned = 1-(serviceUnplanned / totalTime);
			var avServiceUnPlannedCore = 1-(cumUnPlannedCore / totalTime);
			var avServiceUnPlannedNonCore = 1-(cumUnPlannedNonCore / totalTime);

			var avServiceTotal = avServicePlanned * avServiceUnplanned;

			services[s].availability={
					planned:avServicePlanned,
					plannedTime:servicePlanned,
					unplanned:avServiceUnplanned,
					unplannedTime:serviceUnplanned,
					total:avServiceTotal,
					totalTime:(servicePlanned+serviceUnplanned)
				};

			var avPlanned = 1-(cumPlanned / totalTime);
			var avUnPlanned = 1-(cumUnPlanned / totalTime);
		} //end services loop
		if (injectedServices){
			services = services.concat(injectedServices);
		}
		// now calculate the average over all service...

		var _averagePlanned=0.0;
		var _averagePlannedCore=0.0;
		var _averagePlannedNonCore=0.0;

		var _averageUnplanned=0.0;
		var _averageUnPlannedCore=0.0;
		var _averageUnPlannedNonCore=0.0;


		var _averageTotal=0.0;
		var _averageTotalCore=0.0;
		var _averageTotalNonCore=0.0;



		var _rounds = services.length;
		for (var s in services){
			_averagePlanned+=services[s].availability.planned;



			_averageUnplanned+=services[s].availability.unplanned;
		}
		_averagePlanned=_averagePlanned/_rounds;
		_averageUnplanned=_averageUnplanned/_rounds;
		_averageTotal=_averagePlanned*_averageUnplanned;

		var _avResult={};
		_avResult.from=from;
		_avResult.to=to;
		//time of downtime in millisceonds
		_avResult.cumPlanned=cumPlanned;
		_avResult.cumUnplanned=cumUnPlanned;
		_avResult.cumTotal = cumPlanned+cumUnPlanned;
		_avResult.avPlanned=_averagePlanned;
		_avResult.avUnplanned=_averageUnplanned;
		_avResult.avTotal=_averageTotal;
		_avResult.services= services;
		_avResult.from=from;
		_avResult.from=from;
		_avResult.incidentsPlanned = incidentsPlanned;
		_avResult.incidentsUnplanned = incidentsUnplanned;

		_avResult.cumPlannedCore=cumPlannedCore;
		_avResult.cumPlannedNonCore=cumPlannedNonCore;
		_avResult.cumUnPlannedCore=cumUnPlannedCore;
		_avResult.cumUnPlannedNonCore=cumUnPlannedNonCore;
		_avResult.cumTotalCore=cumTotalCore;
		_avResult.cumTotalNonCore=cumTotalNonCore;



		callback(_avResult);
	})
}


function _formatAV(av){
	return (av*100).toFixed(2)+ "%";
}

function _formatDate(time){
	return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

function formatDuration(time){
 	var d = moment.duration(time);
		if (d>=86400000) return d.format("d[d] h:mm:ss", { trim: false });
		return d.format("h:mm:ss", { trim: false });
}


/**
* core time definition should be managed BY CUSTOMER (e.g. bwin has a definition, and US has a different one)
*/
function _checkCoreTime(incident,callback){
	var _coreDefinition=[
		{dayOfWeek:6,start:"12:00:00",stop:"23:59:59"},
		{dayOfWeek:0,start:"00:00:00",stop:"00:59:59"},
		{dayOfWeek:0,start:"12:00:00",stop:"23:59:59"},
		{dayOfWeek:1,start:"00:00:00",stop:"00:59:59"},
		{dayOfWeek:1,start:"16:00:00",stop:"23:59:59"},
		{dayOfWeek:2,start:"16:00:00",stop:"23:59:59"},
		{dayOfWeek:3,start:"16:00:00",stop:"23:59:59"},
		{dayOfWeek:4,start:"16:00:00",stop:"23:59:59"},
		{dayOfWeek:5,start:"16:00:00",stop:"23:59:59"}
	];

	var _start = incident.start;
	var _stop = incident.stop;

	// moment('2010-10-20').isBetween('2009-12-31', '2012-01-01', 'year'); // true

	var _coreTime = 0;
	for (var i in _coreDefinition){
		_coreTime+=_getCoreTime(_start,_stop,_coreDefinition[i]);
	}

	var _degradedCoreTime = _degrade(_coreTime,incident.degradation);
	var _degradedNonCoreTime = _degrade((incident.resolutionTime-_coreTime),incident.degradation);


	callback({coreTime:_degradedCoreTime,nonCoreTime:_degradedNonCoreTime,resolutionTime:incident.resolutionTime});
}


function _getCoreTime(_start,_stop,coreDef){

	// case 1 = INC.start before core.start, INC.end after core.start
	if (moment(_start).day() == coreDef.dayOfWeek && _start <=_getDateForTimeString(coreDef.start,_start) && (_stop <=_getDateForTimeString(coreDef.stop,_stop) && _stop >=_getDateForTimeString(coreDef.start,_start))){
		console.log("CASE-1) where INC start is BEFORE coretime.start definition and stops within coretime");
		var _coreDuration = _stop-_getDateForTimeString(coreDef.start,_start);
		//milliseconds
		return _coreDuration;
	}
	// case 2 = INC.start after core.start, INC.end before core.send
	else if (moment(_start).day() == coreDef.dayOfWeek && _start >=_getDateForTimeString(coreDef.start,_start) && (_stop <=_getDateForTimeString(coreDef.stop,_stop) )){
		console.log("CASE-2) where INC start is AFTER coretime.start definition and stops within coretime");
		var _coreDuration = _stop-_start;
		//milliseconds
		return _coreDuration;
	}
	// case 3 = INC.start after core.start, INC.end after core.end
	else if (moment(_start).day() == coreDef.dayOfWeek && _start >=_getDateForTimeString(coreDef.start,_start) && (_stop >=_getDateForTimeString(coreDef.stop,_stop)) &&(_start <=_getDateForTimeString(coreDef.stop,_stop))){
		console.log("CASE-3) where INC start is AFTER coretime.start definition and stops after coretime");
		var _coreDuration = _start-_getDateForTimeString(coreDef.stop,_stop);
		//milliseconds
		return _coreDuration;
	}

	return 0;
	}




/** returns a concrete DateTime instance for a given Time only
** takes the date info from the _datetime and instantiantes a moment for given timeString
*/
function _getDateForTimeString(_timeString,_datetime){
	var _day = moment(_datetime).date();
	var _month = moment(_datetime).month()+1;
	var _year = moment(_datetime).year();

	var d = new moment(_year+"-"+_month+"-"+_day+" "+_timeString,"YYYY-M-DD HH:mm:ss");

	logger.debug("==== moment created: given timeString: "+_timeString+" date = "+d.toLocaleString());

	return d;
}

/**
* applies degradation function to downtime
*/
function _degrade(_time,_degradation){
	return (_time*(parseFloat(_degradation)/100));
}
