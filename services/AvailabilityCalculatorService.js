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

exports.calculateOverall = _calculateOverall;
exports.calculateExternal = _calculateExternal;
exports.checkCoreTime = _checkCoreTime;
exports.calculateTotalCoreTime = _calculateTotalCoreTime;
exports.checkLabels=checkLabels;
exports.checkServiceToExclude= checkServiceToExclude;
exports.processServices= _processServices;

//sets global config to include endUserAffect flag from SocIncdients
var _endUserAffected = true;

/**
* calculation orchestrator for OVERALL
* param filter: used to filter out incidents for certain customers = to create reports for specific customers, uses labels2customer mapping
**/
function _calculateOverall(from, to, filter,done){
	if (!filter || filter.customer=="* ALL *") filter = null;

	var avService=require('./AvailabilityService');
	//first we grab the external services as we need them to calculate the "ProductIntegration" service
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,filter,_endUserAffected,function(data){
			// the result of this will be injected as "ProductIntegration row in MAIN "
			var _injectServices = [];

			var _avProductIntegration={};
			_avProductIntegration.planned={all:data.av.planned.all,core:data.av.planned.core,nonCore:data.av.planned.nonCore,time:data.downtime.planned};
			_avProductIntegration.unplanned={all:data.av.unplanned.all,core:data.av.unplanned.core,nonCore:data.av.unplanned.nonCore,time:data.downtime.unplanned};
			_avProductIntegration.total={all:data.av.total.all,core:data.av.total.core,nonCore:data.av.total.nonCore,time:data.downtime.total};

			var _productIntegration={
				ServiceName:"Product Integration",
				ext_service:0,
				ServiceGroupID:1,
				Report:1,
				CoreService:1,
				Highlight:0,
				availability:_avProductIntegration
			};
			_injectServices.push(_productIntegration);

			avService.findSOCServicesMain(function(servicesMain){
				_processServices("MAIN",servicesMain,_injectServices,from,to,filter,_endUserAffected,function(data){
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
	if (!filter || filter.customer=="* ALL *") filter = null;

	var avService=require('./AvailabilityService');
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,null,from,to,filter,_endUserAffected,function(data){
			done(data);
		});
	})
}

/**
* param injectedServices: to include calculated stuff from other rounds (legacy need to get this ProductInetgration ...)
* param filter : filter by B2B customer (e.g. bwin)
* testMapping : only used for unit tests
* testIncidents : only used to inject test inicidents for unit tests
**/
function _processServices(type,services,injectedServices,from,to,filter,endUserAffected,callback,testMapping,testIncidents){
	var totalTime={};
	totalTime.all = new Date(to)-new Date(from);
	totalTime.core = _calculateTotalCoreTime(new Date(from),new Date(to));
	totalTime.nonCore = totalTime.all - totalTime.core;

	var _socIncidents = db.collection('socincidents');
	var _label2customer = db.collection('soclabel2customer');

	_label2customer.find(function(err,mapping){
		//{customer:"bwin"};
		var _filterLabels=[];
		if (testMapping) mapping = testMapping;

		if (filter) {
			// now i need a plain array with labels
			var _allLabels = _.pluck(mapping,"label");
			// in written:
			// 1) _.pluck(_.where: give me all labels for the specified customer (e.g. cutomer = bwin => labels = ["bwin.com","bwin.it","bwin.de"....])
			// 2) give me the "opposite" of the other labels => if we will get an intersect of incident.label with this "ANTI-LIST" - we can skip this incident
			_filterLabels =  _.pluck(_.where(mapping,{"customer":filter.customer}),"label");
		}
		// grab the SOC incidents for the intervall (from to)
		_socIncidents.find(function(err,data){
			if (testIncidents) data = testIncidents;
			//logger.debug("***** SOCIncidents: "+JSON.stringify(data));

			var incidents={};
			incidents.planned = [];
			incidents.unplanned = [];
			var downtime={
				planned:{all:0.0,core:0.0,nonCore:0.0},
				unplanned:{all:0.0,core:0.0,nonCore:0.0},
				total:{all:0.0,core:0.0,nonCore:0.0}
			};

			var revenueImpactPlanned;
			var revenueImpactUnplanned;

			//make sure we do not double count
			var revenueImpactDoubleTracker={};

			revenueImpactPlanned=0;
			revenueImpactUnplanned=0;

			//iterate over all services
			for (var s in services){
				var serviceDowntime={
					planned:{all:0.0,core:0.0,nonCore:0.0},
					unplanned:{all:0.0,core:0.0,nonCore:0.0}
				};
				// enrich service for the filter display
				// default we include all
				services[s].filterExclude=false;

				// ==> here we can identify services which can be skipped for a given customer filter
				if (checkServiceToExclude(mapping,filter,services[s])==false){
				//per service iterate over incidents
					for (var i in data){
						var _inc = data[i];
						//logger.debug("+++ revenueImpact: "+_inc.revenueImpact);
						var _labels=[];
						if (_inc.labels){
							_labels = _inc.labels.split(", ");
						}
						if (checkLabels(_filterLabels,_labels) && _inc.serviceName.split(",").indexOf(services[s].ServiceName)>-1 &&_inc.isEndUserDown==endUserAffected && _inc.start>=new Date(from) && _inc.start <=new Date(to)){
							var _time = _degrade(_inc.resolutionTime,_inc.degradation);
							if (_inc.isPlanned==true){
								if (_inc.revenueImpact && !revenueImpactDoubleTracker[_inc.incidentID]){
									revenueImpactPlanned+=parseInt(_inc.revenueImpact);
									revenueImpactDoubleTracker[_inc.id]=true;
								}
								// check core / non-core
								_checkCoreTime(_inc,function(result){
									downtime.planned.all+=_time;
									downtime.planned.core+=result.coreTime;
									downtime.planned.nonCore+=result.nonCoreTime;
									serviceDowntime.planned.all+=_time;
									serviceDowntime.planned.core+=result.coreTime;
									serviceDowntime.planned.nonCore+=result.nonCoreTime;
									//and enrich the incident object with the core / noncore times
									_inc.coreTime = result.coreTime;
									_inc.nonCoreTime = result.nonCoreTime;

									incidents.planned.push(_inc);
								})
							}
							else{
								if (_inc.revenueImpact && !revenueImpactDoubleTracker[_inc.incidentID]){
									 	revenueImpactUnplanned+=parseInt(_inc.revenueImpact);
										revenueImpactDoubleTracker[_inc.id]=true;
								}
								// check core / non-core
								_checkCoreTime(_inc,function(result){
									downtime.unplanned.all+=_time;
									downtime.unplanned.core+=result.coreTime;
									downtime.unplanned.nonCore+=result.nonCoreTime;
									serviceDowntime.unplanned.all+=_time;
									serviceDowntime.unplanned.core+=result.coreTime;
									serviceDowntime.unplanned.nonCore+=result.nonCoreTime;
									//and enrich the incident object with the core / noncore times
									_inc.coreTime = result.coreTime;
									_inc.nonCoreTime = result.nonCoreTime;

									incidents.unplanned.push(_inc);
								})
								downtime.total.core=downtime.unplanned.core+downtime.planned.core;
								downtime.total.nonCore=downtime.unplanned.nonCore+downtime.planned.nonCore;
								downtime.total.all=downtime.total.nonCore+downtime.total.core;
							}
						}
						else{

						}
					} // end for incident loop
					// !!! different total times for core and noncore !!!
					var avService={};
					avService.planned={
						all: 1-(serviceDowntime.planned.all / totalTime.all),
						core: 1-(serviceDowntime.planned.core / totalTime.core),
						nonCore: 1-(serviceDowntime.planned.nonCore / totalTime.nonCore)
					};
					avService.unplanned={
						all: 1-(serviceDowntime.unplanned.all / totalTime.all),
						core: 1-(serviceDowntime.unplanned.core / totalTime.core),
						nonCore: 1-(serviceDowntime.unplanned.nonCore / totalTime.nonCore)
					};
					avService.total={
						all: avService.planned.all*avService.unplanned.all,
						core: avService.planned.core*avService.unplanned.core,
						nonCore: avService.planned.nonCore*avService.unplanned.nonCore
					};

					services[s].availability={
						planned:{all:avService.planned.all,core:avService.planned.core,nonCore:avService.planned.nonCore,time:serviceDowntime.planned.all},
						unplanned:{all:avService.unplanned.all,core:avService.unplanned.core,nonCore:avService.unplanned.nonCore,time:serviceDowntime.unplanned.all},
						total:{all:avService.total.all,core:avService.total.core,nonCore:avService.total.nonCore,time:(serviceDowntime.planned.all+serviceDowntime.unplanned.all)}
					};
				}
				// end if checkServices
			}	//end services loop
			if (injectedServices){
				services = services.concat(injectedServices);
			}




			var average = _calculateAverages(services);

			var _avResult={};
			_avResult.from=from;
			_avResult.to=to;
			//time of downtime in millisceonds
			_avResult.downtime={};
			_avResult.downtime.planned={all:downtime.planned.all,core:downtime.planned.core,nonCore:downtime.planned.nonCore};
			_avResult.downtime.unplanned={all:downtime.unplanned.all,core:downtime.unplanned.core,nonCore:downtime.unplanned.nonCore};
			_avResult.downtime.total={all:downtime.total.all,core:downtime.total.core,nonCore:downtime.total.nonCore};
			_avResult.av={};
			_avResult.av.planned={all:average.planned.all,core:average.planned.core,nonCore:average.planned.nonCore};
			_avResult.av.unplanned={all:average.unplanned.all,core:average.unplanned.core,nonCore:average.unplanned.nonCore};
			_avResult.av.total={all:average.total.all,core:average.total.core,nonCore:average.total.nonCore};
			_avResult.services= services;
			_avResult.incidents={planned:incidents.planned,unplanned:incidents.unplanned};
			_avResult.totalPeriod={all:totalTime.all,core:totalTime.core,nonCore:totalTime.nonCore};

			_avResult.revenueImpact={planned:revenueImpactPlanned,unplanned:revenueImpactUnplanned};

			//logger.debug("xxxxxxxxxxxxxx+++++++ revenueImpactPlanned: "+	revenueImpactPlanned);
			//logger.debug("xxxxxxxxxxxxxx+++++++ revenueImpactUnplanned: "+	_avResult.revenueImpact.unplanned);

			/*
			logger.debug("**************************************************** _averageTotal: "+ average.total.all);
			logger.debug("**************************************************** _averageTotalCore: "+ 	_avResult.avTotalCore);
			logger.debug("**************************************************** _averageTotalNonCore: "+ _avResult.avTotalNonCore);
			logger.debug("############################## filter: "+JSON.stringify(_filterLabels));
			*/
			callback(_avResult);
		})
	})
}

/**
*
*/
function _calculateAverages(services){
	// now calculate the average over all service...
	var average ={
		planned:{all:0.0,core:0.0,nonCore:0.0},
		unplanned:{all:0.0,core:0.0,nonCore:0.0},
		total:{all:0.0,core:0.0,nonCore:0.0}
	};

	var _rounds = 0;
	for (var s in services){
		// second same check
		if (services[s].filterExclude!=true){
			average.planned.all+=services[s].availability.planned.all;
			average.planned.core+=services[s].availability.planned.core;
			average.planned.nonCore+=services[s].availability.planned.nonCore;
			average.unplanned.all+=services[s].availability.unplanned.all;
			average.unplanned.core+=services[s].availability.unplanned.core;
			average.unplanned.nonCore+=services[s].availability.unplanned.nonCore;
			_rounds++;
		}
	}
	average.planned.all=average.planned.all/_rounds;
	average.planned.core=average.planned.core/_rounds;
	average.planned.nonCore=average.planned.nonCore/_rounds;

	average.unplanned.all=average.unplanned.all/_rounds;
	average.unplanned.core=average.unplanned.core/_rounds;
	average.unplanned.nonCore=average.unplanned.nonCore/_rounds;

	average.total.all=average.planned.all*average.unplanned.all;
	average.total.core=average.planned.core*average.unplanned.core;
	average.total.nonCore=average.planned.nonCore*average.unplanned.nonCore;

	return average;
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


/** given e.g. customer filter is set to "bwin" - we have to exclude to serices for the AV calculation which are NOT used in the according "bwin" contest
* e.g. services like "US -Poker, US-Casino" have no appearance in the label2customer matrix => and therefore can be skipped
* e.g. service ="US - POKER "
* e.g. labelsFilter = ["bwin.com","bwin.fr",.....]
**/
function checkServiceToExclude(mapping,filter,service){
	if (!filter) return false;

	var _filteredMapping = _.where(mapping,{"customer":filter.customer});
	var count =0;
	for (var m in _filteredMapping){
			var _line = _filteredMapping[m];
			if (_line[service.ServiceName] =="1") {
				count++;
			}
	}
	if (count>0) return false;
	else {
		service.filterExclude=true;
		return true;
	}
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
e.g.
	{"dayOfWeek":3,"start":"16:00:00","stop":"23:59:59"},
	{"dayOfWeek":4,"start":"16:00:00","stop":"23:59:59"},
	{"dayOfWeek":5,"start":"16:00:00","stop":"23:59:59"}
*/
function _calculateTotalCoreTime(from,to){
	var _coreDefinition= config.availability.coreTime;
	var _coreTotalTime =0;
	// iterate over days
	while(from < to){
    var newDate = from.setDate(from.getDate() + 1);
    from = new Date(newDate);
		//logger.debug("----day: "+moment(newDate).format("YYYY-MM-DD"));
		for (var i in _coreDefinition){
			if (moment(from).day()==_coreDefinition[i].dayOfWeek){
				var _c = moment(_coreDefinition[i].stop,"HH:mm:ss")-moment(_coreDefinition[i].start,"HH:mm:ss");
				_coreTotalTime+=_c
				//logger.debug("* core time span:"+_c);
			}
		}
  }
	//logger.debug("*********** core time OVERALL:"+_coreTotalTime);
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
/**
* calculate the absolute amount of coe time for a given date range
*/
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
	//logger.debug("==== moment created: given timeString: "+_timeString+" date = "+d.toLocaleString());
	return d;
}

/**
* applies degradation function to downtime
*/
function _degrade(_time,_degradation){
	return (_time*(parseFloat(_degradation)/100));
}
