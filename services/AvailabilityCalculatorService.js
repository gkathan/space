/** re-implementation of bpty legacy way of calculating availability
 * from avreport.bwinparty.corp
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
exports.calculateTotalCoreTime = _calculateTotalCoreTime;
exports.checkLabels=checkLabels;


/**
* calculation orchestrator for OVERALL
* param filter: used to filter out incidents for certain customers = to create reports for specific customers, uses labels2customer mapping
**/
function _calculateOverall(from, to, filter,done){

	var avService=require('./AvailabilityService');
	//first we grab the external services as we need them to calculate the "ProductIntegration" service
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,filter,function(data){
			// the result of this will be injected as "ProductIntegration row in MAIN "
			var _injectServices = [];

			var _productIntegration={
				ServiceName:"Product Integration",
				ext_service:0,
				ServiceGroupID:1,
				Report:1,
				CoreService:1,
				Highlight:0,
				availability:{
					planned:data.avPlanned,
					plannedCore:data.avPlannedCore,
					plannedNonCore:data.avPlannedNonCore,
					unplanned:data.avUnplanned,
					unplannedCore:data.avUnplannedCore,
					unplannedNonCore:data.avUnplannedNonCore,
					total:data.avTotal,
					totalCore:data.avTotalCore,
					totalNonCore:data.avTotalNonCore,
					plannedTime:data.downtimePlanned,
					unplannedTime:data.downtimeUnplanned,
					totalTime:data.downtimeTotal,
					totalPeriod:data.totalPeriod,
					totalPeriodCore:data.totalPeriodCore,
					totalPeriodNonCore:data.totalPeriodNonCore
				}
			};

			_injectServices.push(_productIntegration);
			avService.findSOCServicesMain(function(servicesMain){
				_processServices("MAIN",servicesMain,_injectServices,from,to,filter,function(data){
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
function _calculateExternal(from, to,filter,done){
	var avService=require('./AvailabilityService');
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,filter,function(data){
			done(data);
		});
	})
}

/**
* param injectedServices: to include calculated stuff from other rounds (legacy need to get this ProductInetgration ...)
**/
function _processServices(type,services,injectedServices,from,to,filter,callback){
	var totalTime = new Date(to)-new Date(from);
	var totalTimeCore = _calculateTotalCoreTime(new Date(from),new Date(to));
	var totalTimeNonCore = totalTime - totalTimeCore;

	var _socIncidents = db.collection('socincidents');
	var _label2customer = db.collection('label2customer');

	_label2customer.find(function(err,mapping){
		//{customer:"bwin"};
		var _filterLabels=[];
		
		if (filter) {
			// now i need a plain array with labels
			var _allLabels = _.pluck(mapping,"label");
			// in written:
			// 1) _.pluck(_.where: give me all labels for the specified customer (e.g. cutomer = bwin => labels = ["bwin.com","bwin.it","bwin.de"....])
			// 2) give me the "opposite" of the other labels => if we will get an intersect of incident.label with this "ANTI-LIST" - we can skip this incident
			_filterLabels =  _.pluck(_.where(mapping,{"customer":filter.customer}),"label");

		}

		_socIncidents.find(function(err,data){
			// grab the SOC incidents for the intervall (from to)
			var downtimePlanned = 0.0;
			var downtimePlannedCore = 0.0;
			var downtimePlannedNonCore = 0.0;

			var downtimeUnplanned = 0.0;
			var downtimeUnplannedCore = 0.0;
			var downtimeUnplannedNonCore = 0.0;

			var downtimeTotalCore = 0.0;
			var downtimeTotalNonCore = 0.0;

			var incidentsPlanned = [];
			var incidentsUnplanned = [];
			//iterate over all services
			for (var s in services){
				var servicePlanned = 0.0;
				var servicePlannedCore = 0.0;
				var servicePlannedNonCore = 0.0;
				var serviceUnplanned = 0.0;
				var serviceUnplannedCore = 0.0;
				var serviceUnplannedNonCore = 0.0;
				//per service iterate over incidents
				for (var i in data){
					var _inc = data[i];

					var _labels=[];
					if (_inc.labels){
						_labels = _inc.labels.split(", ");
					}



						if (checkLabels(_filterLabels,_labels) && _inc.serviceName.split(",").indexOf(services[s].ServiceName)>-1 &&_inc.isEndUserDown && _inc.start>=new Date(from) && _inc.start <=new Date(to)){
							var _time = _degrade(_inc.resolutionTime,_inc.degradation);
							if (_inc.isPlanned==true){
								// check core / non-core
								_checkCoreTime(_inc,function(result){
									downtimePlanned+=_time;
									downtimePlannedCore+=result.coreTime;
									downtimePlannedNonCore+=result.nonCoreTime;
									servicePlanned+=_time;
									servicePlannedCore+=result.coreTime;
									servicePlannedNonCore+=result.nonCoreTime;
									//and enrich the incident object with the core / noncore times
									_inc.coreTime = result.coreTime;
									_inc.nonCoreTime = result.nonCoreTime;

									incidentsPlanned.push(_inc);
								})
							}
							else{
								// check core / non-core
								_checkCoreTime(_inc,function(result){
									downtimeUnplanned+=_time;
									downtimeUnplannedCore+=result.coreTime;
									downtimeUnplannedNonCore+=result.nonCoreTime;

									serviceUnplanned+=_time;
									serviceUnplannedCore+=result.coreTime;
									serviceUnplannedNonCore+=result.nonCoreTime;

									//and enrich the incident object with the core / noncore times
									_inc.coreTime = result.coreTime;
									_inc.nonCoreTime = result.nonCoreTime;

									incidentsUnplanned.push(_inc);
								})
								downtimeTotalCore=downtimeUnplannedCore+downtimePlannedCore;
								downtimeTotalNonCore=downtimeUnplannedNonCore+downtimePlannedNonCore;
							}

					}
				} // end for incident loop

				// !!! different total times for core and noncore !!!
				var avServicePlanned = 1-(servicePlanned / totalTime);
				var avServicePlannedCore = 1-(servicePlannedCore / totalTimeCore);
				var avServicePlannedNonCore = 1-(servicePlannedNonCore / totalTimeNonCore);

				var avServiceUnplanned = 1-(serviceUnplanned / totalTime);
				var avServiceUnplannedCore = 1-(serviceUnplannedCore / totalTimeCore);
				var avServiceUnplannedNonCore = 1-(serviceUnplannedNonCore / totalTimeNonCore);

				var avServiceTotal = avServicePlanned * avServiceUnplanned;
				var avServiceTotalCore = avServicePlannedCore * avServiceUnplannedCore;
				var avServiceTotalNonCore = avServicePlannedNonCore * avServiceUnplannedNonCore;

				services[s].availability={
					planned:avServicePlanned,
					plannedCore:avServicePlannedCore,
					plannedNonCore:avServicePlannedNonCore,
					plannedTime:servicePlanned,
					unplanned:avServiceUnplanned,
					unplannedCore:avServiceUnplannedCore,
					unplannedNonCore:avServiceUnplannedNonCore,
					unplannedTime:serviceUnplanned,
					total:avServiceTotal,
					totalCore:avServiceTotalCore,
					totalNonCore:avServiceTotalNonCore,
					totalTime:(servicePlanned+serviceUnplanned)
				};
			} //end services loop

			if (injectedServices){
				services = services.concat(injectedServices);
			}
			// now calculate the average over all service...
			var _averagePlanned=0.0;
			var _averagePlannedCore=0.0;
			var _averagePlannedNonCore=0.0;

			var _averageUnplanned=0.0;
			var _averageUnplannedCore=0.0;
			var _averageUnplannedNonCore=0.0;


			var _averageTotal=0.0;
			var _averageTotalCore=0.0;
			var _averageTotalNonCore=0.0;



			var _rounds = services.length;
			for (var s in services){
				_averagePlanned+=services[s].availability.planned;
				_averagePlannedCore+=services[s].availability.plannedCore;
				_averagePlannedNonCore+=services[s].availability.plannedNonCore;

				_averageUnplanned+=services[s].availability.unplanned;
				_averageUnplannedCore+=services[s].availability.unplannedCore;
				_averageUnplannedNonCore+=services[s].availability.unplannedNonCore;
			}
			_averagePlanned=_averagePlanned/_rounds;
			_averagePlannedCore=_averagePlannedCore/_rounds;
			_averagePlannedNonCore=_averagePlannedNonCore/_rounds;

			_averageUnplanned=_averageUnplanned/_rounds;
			_averageUnplannedCore=_averageUnplannedCore/_rounds;
			_averageUnplannedNonCore=_averageUnplannedNonCore/_rounds;

			_averageTotal=_averagePlanned*_averageUnplanned;
			_averageTotalCore=_averagePlannedCore*_averageUnplannedCore;
			_averageTotalNonCore=_averagePlannedNonCore*_averageUnplannedNonCore;

			var _avResult={};
			_avResult.from=from;
			_avResult.to=to;
			//time of downtime in millisceonds
			_avResult.downtimePlanned=downtimePlanned;
			_avResult.downtimeUnplanned=downtimeUnplanned;
			_avResult.downtimeTotal = downtimePlanned+downtimeUnplanned;
			_avResult.avPlanned=_averagePlanned;
			_avResult.avPlannedCore=_averagePlannedCore;
			_avResult.avPlannedNonCore=_averagePlannedNonCore;
			_avResult.avUnplanned=_averageUnplanned;
			_avResult.avUnplannedCore=_averageUnplannedCore;
			_avResult.avUnplannedNonCore=_averageUnplannedNonCore;
			_avResult.avTotal=_averageTotal;
			_avResult.avTotalCore=_averageTotalCore;
			_avResult.avTotalNonCore=_averageTotalNonCore;
			_avResult.services= services;
			_avResult.from=from;
			_avResult.from=from;
			_avResult.incidentsPlanned = incidentsPlanned;
			_avResult.incidentsUnplanned = incidentsUnplanned;

			_avResult.downtimePlannedCore=downtimePlannedCore;
			_avResult.downtimePlannedNonCore=downtimePlannedNonCore;
			_avResult.downtimeUnplannedCore=downtimeUnplannedCore;
			_avResult.downtimeUnplannedNonCore=downtimeUnplannedNonCore;
			_avResult.downtimeTotalCore=downtimeTotalCore;
			_avResult.downtimeTotalNonCore=downtimeTotalNonCore;

			_avResult.totalPeriod=totalTime;
			_avResult.totalPeriodCore=totalTimeCore;
			_avResult.totalPeriodNonCore=totalTimeNonCore;

			console.log("**************************************************** _averageTotal: "+ _averageTotal);
			console.log("**************************************************** _averageTotalCore: "+ 	_avResult.avTotalCore);
			console.log("**************************************************** _averageTotalNonCore: "+ _avResult.avTotalNonCore);

			console.log("############################## filter: "+JSON.stringify(_filterLabels));

			callback(_avResult);
		})
})

}

/**
* checks whether a given list of labels from an incdient is relevant for a filter list of labels
* param: labelsFilter = list of labels which belong to a customer e.g. for bwin this is ["bwin.com","bwin.it","bwin.es","bwin.fr"]
* param: labelsIncident = list of labels affected by an incident e.g. ["pmu.fr","bwin.com"]
* return: true if either labelsIncident is null or empty, or the intersection of the 2 lists includes a value
*/
function checkLabels(labelsFilter,labelsIncident){
	if (!labelsIncident || labelsIncident.length==0 || labelsFilter.length==0) return true;
	else if (_.intersection(labelsFilter,labelsIncident).length>0) return true;
	return false;

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


function _calculateTotalCoreTime(from,to){
	var _coreDefinition= config.availability.coreTime;
	/*
				{"dayOfWeek":6,"start":"12:00:00","stop":"23:59:59"},
				{"dayOfWeek":0,"start":"00:00:00","stop":"00:59:59"},
				{"dayOfWeek":0,"start":"12:00:00","stop":"23:59:59"},
				{"dayOfWeek":1,"start":"00:00:00","stop":"00:59:59"},
				{"dayOfWeek":1,"start":"16:00:00","stop":"23:59:59"},
				{"dayOfWeek":2,"start":"16:00:00","stop":"23:59:59"},
				{"dayOfWeek":3,"start":"16:00:00","stop":"23:59:59"},
				{"dayOfWeek":4,"start":"16:00:00","stop":"23:59:59"},
				{"dayOfWeek":5,"start":"16:00:00","stop":"23:59:59"}

	*/
	var _coreTotalTime =0;

	// iterate over days
	while(from < to){
    var newDate = from.setDate(from.getDate() + 1);
    from = new Date(newDate);
		logger.debug("----day: "+moment(newDate).format("YYYY-MM-DD"));

		for (var i in _coreDefinition){
			if (moment(from).day()==_coreDefinition[i].dayOfWeek){
				var _c = moment(_coreDefinition[i].stop,"HH:mm:ss")-moment(_coreDefinition[i].start,"HH:mm:ss");
				_coreTotalTime+=_c
				logger.debug("* core time span:"+_c);
			}
		}
  }

	logger.debug("*********** core time OVERALL:"+_coreTotalTime);

	return _coreTotalTime;
}


/**
* core time definition should be managed BY CUSTOMER (e.g. bwin has a definition, and US has a different one)
*/
function _checkCoreTime(incident,callback){
	var _coreDefinition= config.availability.coreTime;

	var _start = incident.start;
	var _stop = incident.stop;

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
