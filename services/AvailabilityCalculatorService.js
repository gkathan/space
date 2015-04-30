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


function _getStuff(context,callback) {
	logger.debug("getStuff() called: context= "+context);
  logger.debug("_connectionstring: "+connection_string);
	var items =  db.collection('incidents');
	items.find({}).sort({openedAt:-1}, function (err, docs){
			//logger.debug("*****");
			callback(docs);
			//return;
	});
}

function _calculateOverall(from, to){
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


	// grab the SOC incidents for the intervall (from to)

	// walk over each incdient

		// do the start stop special handling


}
