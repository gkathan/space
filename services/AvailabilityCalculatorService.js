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

function _calculateOverall(from, to, done){
	var avService=require('./AvailabilityService');
	avService.findSOCServicesExternal(function(servicesExt){
		_processServices("EXTERNAL",servicesExt,from,to,function(data){
					// data is what i get from first
					logger.debug("***************************************************");
					logger.debug("***************************************************");
					avService.findSOCServicesMain(function(servicesMain){
						_processServices("MAIN",servicesMain,from,to,function(data){
							done(data);
						});
					})
		});
	})
}

function _processServices(type,services,from,to,callback){
		var totalTime = new Date(to)-new Date(from);

		var _socIncidents = db.collection('socincidents');

		_socIncidents.find(function(err,data){
		// grab the SOC incidents for the intervall (from to)
		logger.debug("************** services: "+type+" rounds: "+services.length);
		var cumPlanned = 0.0;
		var cumUnPlanned = 0.0;
		//iterate over all services
		for (var s in services){
			logger.debug("==== SERVICE: "+services[s].ServiceName);
			var planned = [];
			var unplanned = [];
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
						planned.push(_inc);
						logger.debug("---- planned: "+_inc.incidentID+" _time: "+_time);
					}
					else{
						cumUnPlanned+=_time;
						serviceUnplanned+=_time;
						unplanned.push(_inc);
						logger.debug("---- unplanned: "+_inc.incidentID+" _time: "+_time);
					}
				}
			}
			var avServicePlanned = 1-(servicePlanned / totalTime);
			var avServiceUnplanned = 1-(serviceUnplanned / totalTime);
			var avServiceTotal = avServicePlanned * avServiceUnplanned;

			services[s].availability={planned:avServicePlanned,unplanned:avServiceUnplanned};

			logger.debug("---- [downtime] planned: "+servicePlanned+" [downtime] unplanned: "+serviceUnplanned);
			logger.debug("---- [availability] planned: "+_formatAV(avServicePlanned)+" [availability] unplanned: "+_formatAV(avServiceUnplanned));

			var avPlanned = 1-(cumPlanned / totalTime);
			var avUnPlanned = 1-(cumUnPlanned / totalTime);
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

		logger.debug("AVERAGED PLANNED AVAILABILITY over "+_rounds+ " services: "+_formatAV(_averagePlanned));
		logger.debug("AVERAGED UNPLANNED AVAILABILITY over "+_rounds+ " services: "+_formatAV(_averageUnplanned));
		logger.debug("AVERAGED TOTAL AVAILABILITY over "+_rounds+ " services: "+_formatAV(_averageTotal));

		callback("from: "+from+" to: "+to+ " - cumPlanned: "+cumPlanned+" | cumPnplanned: "+cumUnPlanned+" --- totalTime: "+totalTime+ "avPlanned: <b>"+_formatAV(_averagePlanned)+"</b> avUnPlanned: <b>"+_formatAV(_averageUnplanned)+"</b> avTotal: <b>"+_formatAV(_averageTotal)+"</b><br><br>planned INCs: "+planned.length+" unplanned INCs: "+unplanned.length);
	})
}


function _formatAV(av){
	return (av*100).toFixed(2)+ "%";
}
