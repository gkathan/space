/**
 * incident service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
require('moment-duration-format');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

/**
 *
 */
exports.find = function (callback) {
	var items =  db.collection('incidents');
	items.find({}).sort({openedAt:-1}, function (err, docs){
			callback(docs);
			return;
	});
}

/**
 * param prioritylist: ["P1","P8","P40"]
 *
 */
exports.findGroupedByPriority = function (prioritylist){
	var av = (100-parseFloat(avpercentageYTD))*100;
	console.log("av: "+av);
	var minutes = av*weeks;
	return moment.duration(minutes,'minutes').format("hh:mm.ss");;
}

exports.mapPriority = _mapPriority;
exports.mapState = _mapState;

/**
* mapping of internal snow codes to bpty codes
*
*/
function _mapPriority(_prio){
	return _mapCode(_prio,"priority","bpty");
}

function _mapState(_state){
	return _mapCode(_state,"state","bpty");
}

function _mapCode(_code,_collection,_resolve){
	var _mapping = config.mappings.snow[_collection];
	var _lookup = _.findWhere(_mapping,{"sys":parseInt(_code)});
	if (_lookup)
		return _lookup[_resolve];
	else return false;

}
