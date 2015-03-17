/**
 * context service
 * multi tenancy, multi skin
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
exports.switch = function (name,callback) {
	logger.debug("switch called: name= "+name);
	
	callback(findContext(name));
	
}
	
function findContext(name){
	logger.debug("--------------------------------- findContext for name: "+name);
	var entities =  config.entities;
	var context = _.findWhere(entities,{'name':name});
	
	return context; 
}





