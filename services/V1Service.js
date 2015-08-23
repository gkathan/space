/**
 * V1Service encapsulated fucntionality
 */

var config = require('config');
var mongojs = require("mongojs");

var _ = require('lodash');

var DB="space";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

exports.findEpics=_findEpics;
exports.findInitiativeEpics=_findInitiativeEpics;
exports.findPortfolioApprovalEpics=_findPortfolioApprovalEpics;
exports.getRoadmapInitiatives=_getRoadmapInitiatives;

/**
 * find all Epics
 */
function _findEpics(callback) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(docs, "Number")
			callback(err,_e);
			return;
	});
}

function _findInitiativeEpics(callback) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(_.where(docs,{CategoryName:"Initiative"}), "Number")
			callback(err,_e);
			return;
	});
}

function _findPortfolioApprovalEpics(callback) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(_.where(docs,{PortfolioApproval:"Yes"}), "Number")
			callback(err,_e);
			return;
	});
}

function _getRoadmapInitiatives(start,callback){
	_findInitiativeEpics(function (err,initiatives){
		var _roadmap = [];
		for (var i in initiatives){
			var _in=initiatives[i];
			if (new Date(_in.PlannedStart)>=start) _roadmap.push(_in);
		}
		callback(err,_roadmap);
	});
}


/**
 * @param epicRef E-08383 format
 */
exports.findEpicByRef = function(epicRef,callback) {
	var epics =  db.collection('v1epics');
	epics.find( function(err , docs){
			var _e =docs;
			for (var i in _e){
				if (_e[i].Number==epicRef){
					var _epic = _e[i];
					callback(_epic);
					return;
				}
			}
	});
	return;
}
