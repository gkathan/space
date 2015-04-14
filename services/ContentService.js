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
exports.getLatestSpaceNews = function (context,callback) {
	logger.debug("getSpaceNews() called: context= "+context);

	var content =  db.collection('content');
		content.find({'type':'index.spacenews'}).sort({$natural:-1}, function (err, docs){
			//sort

			callback(docs[0]);
			return;
	});


}
