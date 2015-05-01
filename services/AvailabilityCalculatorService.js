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
exports.getStuff = _getStuff;
exports.calculateOverall = _calculateOverall;



function _getStuff(context,callback) {
	logger.debug("getStuff() called: context= "+context);
  logger.debug("_connectionstring: "+connection_string);
	logger.debug("_db: "+db);

	var availability =  db.collection('availability');

	availability.find(function(err,docs){
			logger.debug("xxxxxxxxxxxxxxxxxxxxxx");

			callback("ubba");
	});
}



	/*
	var includeExternal = false;

	//Set all 0
	var AvTotalUnplanned = 0.0;
	var AvTotalPlanned = 0.0;

	//what is YTN?
	var YTN1total = 0.0;
	var YTN2total = 0.0;

	//is Forecast used ??
	// => uses the Target values to calculate some shit
	// => i think this is NOT used !!
	var Forecast1total = 0.0;
	var Forecast2total = 0.0;

	var totalDowntimetotal = 0.0;

	//internal
	var pldtintotal = 0.0;
	var unpldtintotal = 0.0;
	//external
	var pldtextotal = 0.0;
	var unpldtextotal = 0.0;

	var technicalDowntimetotal = 0.0;
	var rounds = 0;
	*/

function _calculateOverall(from, to, callback){
	// total timespan of period
	var totalTime = new Date(to)-new Date(from);

	var _socIncidents = db.collection('socincidents');
	_socIncidents.find(function(err,data){
	// grab the SOC incidents for the intervall (from to)

		var cumPlanned = 0.0;
		var cumUnPlanned = 0.0;

		var planned = [];
		var unplanned = [];

		for (var i in data){
			var _inc = data[i];

			if (_inc.isEndUserDown && _inc.start>=new Date(from) && _inc.start <=new Date(to)){
					if (_inc.isPlanned==true){
							cumPlanned+=_inc.resolutionTime*(parseFloat(_inc.degradation)/100);
							planned.push(_inc);
					}
					else{
							cumUnPlanned+=_inc.resolutionTime*(parseFloat(_inc.degradation)/100);
							unplanned.push(_inc);
					}
			}
			var avPlanned = 1-(cumPlanned / totalTime);
			var avUnPlanned = 1-(cumUnPlanned / totalTime);
		}
		callback("from: "+from+" to: "+to+ " - cumPlanned: "+cumPlanned+" | cumPnplanned: "+cumUnPlanned+" --- totalTime: "+totalTime+ "avPlanned: <b>"+(avPlanned*100).toFixed(2)+ "%</b> avUnPlanned: <b>"+(avUnPlanned*100).toFixed(2)+"%</b><br><br>planned INCs: "+JSON.stringify(planned)+" unplanned INCs: "+JSON.stringify(unplanned));
	})

	// socservices
	//   * find("Report":true, "ServiceGroupID":1, "ext_service": true/false)
	//	 * ext_service true => unterer teil => average of that will be the "ProductIntegration which is used for oberer teil"

	// walk over each incdient

		// do the start stop special handling





}
