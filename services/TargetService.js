/**
 * target service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston = require('winston');
winston.loggers.add('test_log',{
	console:{
		colorize:true,
		prettyPrint:true,
		showLevel:true,
		timestamp:true,
		level:"debug"
	},
    file:{
		filename: 'logs/test.log' ,
		prettyPrint:true,
		showLevel:true,
		level:"debug"
	}
});

var logger = winston.loggers.get('test_log');

/**
 *
 */
exports.getL1 = function (context,callback) {
	var targets =  db.collection('targets');
	targets.find({context:context,"type":"L1"}).sort({$natural:1}, function (err, docs){
			debugger;

			callback(docs);
			return;
	});
}

exports.getL2 = function (context,callback) {
	var targets =  db.collection('targets');
	targets.find({context:context,"type":"L2"}).sort({$natural:1}, function (err, docs){

			callback(docs);
			return;
	});
}

exports.getAll = function (context,callback) {
	var targets =  db.collection('targets');



	targets.find({context:{$regex: '^'+context}}).sort({context:-1}, function (err, docs){
		if(err){
			logger.info("error:"+err);
		}
		else if(docs){
			logger.debug("find targets: "+docs);
			callback(docs);
			return;
		}
		return;
	});
}
