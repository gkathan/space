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
// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.getL1 = _getL1;
exports.getL2 = _getL2;
exports.getL2ById = _getL2ById;

exports.getAll = _getAll;
exports.getL2Tree = _getL2Tree;

/**
 *
 */
function _getL1(context,callback) {
	var targets =  db.collection('targets');
	targets.find({context:context,"type":"L1"}).sort({id:1}, function (err, docs){
		callback(err,docs);
		return;
	});
}

function _getL2(context,callback) {
	var targets =  db.collection('targets');
	targets.find({context:context,"type":"L2"}).sort({id:1}, function (err, docs){
		callback(err,docs);
		return;
	});
}

function _getL2ById(context,id,callback) {
	var targets =  db.collection('targets');
	targets.findOne({context:context,"type":"L2",id:id}, function (err, target){
		callback(err,target);
		return;
	});
}



function _getAll(context,callback) {
	var targets =  db.collection('targets');

	targets.find({context:{$regex: '^'+context}}).sort({context:-1}, function (err, docs){
		if(err){
			logger.info("error:"+err);
			callback(err);
		}
		else if(docs){
			logger.debug("find targets: "+docs);
			callback(err,docs);
			return;
		}
		return;
	});
}

function _getL2Tree(context,callback){
	_getL2(context,function(err,result){
		if (err){
				callback(err);
		}
		else{
				_.nst = require('underscore.nest');
			var nestLevels = ["context","theme","group"];
			var tree = _.nst.nest(result,nestLevels);

	    callback(null,tree.children);
	    return;
		}
	});
}
