/**
 *
 *
 * .....
 */
var config = require('config');
var mongojs = require('mongojs');
var _ = require('lodash');

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
		var cumUnPlanned = 0.0;
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
					var _time = _inc.resolutionTime*(parseFloat(_inc.degradation)/100);
					if (_inc.isPlanned==true){
						cumPlanned+=_time;
						servicePlanned+=_time;
						incidentsPlanned.push(_inc);
					}
					else{
						cumUnPlanned+=_time;
						serviceUnplanned+=_time;
						incidentsUnplanned.push(_inc);
					}
				}
			}
			var avServicePlanned = 1-(servicePlanned / totalTime);
			var avServiceUnplanned = 1-(serviceUnplanned / totalTime);
			var avServiceTotal = avServicePlanned * avServiceUnplanned;

			services[s].availability={planned:avServicePlanned,plannedTime:servicePlanned,unplanned:avServiceUnplanned,unplannedTime:serviceUnplanned,total:avServiceTotal,totalTime:(servicePlanned+serviceUnplanned)};

			var avPlanned = 1-(cumPlanned / totalTime);
			var avUnPlanned = 1-(cumUnPlanned / totalTime);
		} //end services loop
		if (injectedServices){
			services = services.concat(injectedServices);
		}
		// now calculate the average over all service...
		var _averagePlanned=0.0;
		var _averageUnplanned=0.0;
		var _averageTotal=0.0;
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

		callback(_avResult);
	})
}


function _formatAV(av){
	return (av*100).toFixed(2)+ "%";
}
