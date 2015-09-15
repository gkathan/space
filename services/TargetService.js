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
exports.getL1ByPeriod = _getL1ByPeriod;
exports.getL2ByPeriod = _getL2ByPeriod;
exports.getL2Groups = _getL2Groups;
exports.getL2ById = _getL2ById;

exports.getAll = _getAll;
exports.getAllByPeriod = _getAllByPeriod;
exports.getL2Tree = _getL2Tree;
exports.getPeriod = _getPeriod;

/**
 *
*/
function _getL1(context,callback) {
	// default period
	_getL1ByPeriod(context,_getPeriod(),callback);
}

function _getL1ByPeriod(context,period,callback) {
	var targets =  db.collection('targets'+period);
	targets.find({context:context,"type":"L1"}).sort({id:1}, function (err, docs){
		callback(err,docs);
		return;
	});
}


function _getL2(context,callback) {
	_getL2ByPeriod(context,_getPeriod(),callback);
}

function _getL2ByPeriod(context,callback,period) {
	var targets =  db.collection('targets'+period);
	targets.find({context:context,"type":"L2"}).sort({id:1}, function (err, docs){
		callback(err,docs);
		return;
	});
}

function _getL2Groups(context,callback) {
	_getL2GroupsByPeriod(context,_getPeriod(),callback)
}

function _getL2GroupsByPeriod(context,period,callback) {
	var targets =  db.collection('targets'+period);
	targets.find({context:context,"type":"L2"}).sort({id:1}, function (err, docs){

		var _L2Groups = [];
		var _grouped = _.groupBy(docs,"group");
		var _targetSortOrder = config.targets.laneSorting;

		logger.debug("sorting: "+_targetSortOrder);

		for (var i in _.keys(_grouped)){
			var _key = _.keys(_grouped)[i];
			var _refTarget = _grouped[_key][0];
			logger.debug("_key: "+_key);
			logger.debug("group: "+_grouped[_key][0].id);

			var _group = {id:_refTarget.id.split(".")[0],name:_key,theme:_refTarget.theme,icon:_refTarget.icon,L2targets:_grouped[_key]};
			_L2Groups.push(_group)
		}
		callback(err,_.groupBy(_L2Groups,"theme"));
		return;
	});
}


function _getL2ById(context,id,callback) {
	_getL2ByIdByPeriod(context,id,_getPeriod(),callback);
}
function _getL2ByIdByPeriod(context,id,period,callback) {
	var targets =  db.collection('targets'+period);
	targets.findOne({context:context,"type":"L2",id:id}, function (err, target){
		callback(err,target);
		return;
	});
}


function _getAllByPeriod(context,period,callback) {
	var targets =  db.collection('targets'+period);
	logger.debug("---- targets._getAll: context = "+context);
	targets.find({context:{$regex: '^'+context}}).sort({id:1}, function (err, docs){
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

function _getAll(context,callback) {
	// take current year
	var _period = moment().year();
	_getAllByYear(context,_period,callback);
}

function _getL2Tree(context,callback){
	_getL2TreeByPeriod(context,_getPeriod(),callback);
}

function _getL2TreeByPeriod(context,period,callback){
	_getL2ByPeriod(context,period,function(err,result){
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

/** helper
*/
function _getPeriod(){
	var _period;
	if (config.targets.active){
		_period = config.targets.active;
		logger.debug("active period by config = "+_period);
	}
	else{
		_period= moment().year();
		logger.debug("period derived by moment, no CONFIG.active found = "+_period);
	}
	return _period;
}
