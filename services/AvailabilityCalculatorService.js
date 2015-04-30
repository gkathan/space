/**
 * simple content management  service
 *
 * .....
 */


var config = require('config');

var mongojs = require('mongojs');

var _ = require('lodash');


var DATABASE=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DATABASE;
var db = mongojs(connection_string, [DATABASE]);


var winston=require('winston');
var logger = winston.loggers.get('space_log');

/**
 *
 */
exports.getStuff = _getStuff;


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
