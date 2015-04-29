/**
 * simple content management  service
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
