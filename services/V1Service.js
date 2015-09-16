/**
 * V1Service encapsulated fucntionality
 */
var config = require('config');
var mongojs = require("mongojs");

var _ = require('lodash');

var DB="space";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');

exports.findEpics=_findEpics;
exports.findEpicsWithChildren=_findEpicsWithChildren;
exports.findInitiativesWithPlanningEpics = _findInitiativesWithPlanningEpics;
exports.findInitiativeEpics=_findInitiativeEpics;
exports.findPortfolioApprovalEpics=_findPortfolioApprovalEpics;
exports.getRoadmapInitiatives=_getRoadmapInitiatives;
exports.getRoot=_getRoot;
exports.getPlanningEpics=_getPlanningEpics;

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

function _findEpicsWithChildren(filter,callback) {
	var epics =  db.collection('v1epics');
		epics.find(filter, function (err, epics){
			logger.debug("============= _findEpicsWithChildren - found: "+epics.length+ " epics for: "+JSON.stringify(filter));
			for (var e in epics){
				if (epics[e].EpicRootNumber){
					var _e=_.findWhere(epics,{"Number":epics[e].EpicRootNumber});
					if (_e && !_e.Children) _e.Children =[];
					if (_e) _e.Children.push(epics[e]);
				}
			}
			callback(err,epics);
			return;
	});
}


/** this is for peter :-)
* collects all initiatives and puts planning epics as children*
*/
// ,{"PortfolioApproval":"Yes"}
function _findInitiativesWithPlanningEpics(filter,callback){
	//var _prefilter = {$and:[{$or:[{CategoryName:"Initiative"},{CategoryName:"Planning"}]},{$or:[{Status:"Conception"},{Status:"Understanding"},{Status:"Implementation"}]},{"PortfolioApproval":"Yes"}]};
	//var _prefilter = {$and:[{$or:[{CategoryName:"Initiative"},{CategoryName:"Planning"},{CategoryName:"Product Contribution"}]},{$or:[{Status:"Conception"},{Status:"Understanding"},{Status:"Implementation"}]}]};
	var _prefilter = {$and:[{$or:[{CategoryName:"Initiative"},{CategoryName:"Planning"},{CategoryName:"Product Contribution"}]}]};
	//var _prefilter={};
	_findEpicsWithChildren(_prefilter,function(err,epics){

		var _initiatives = [];


		for (var e in epics){
			var _e = epics[e];
			if (_e.EpicRootNumber){
				// needs to be recusrsive.....
				logger.debug("okokok: epic.root= "+_e.EpicRootNumber+" Number = "+_e.Number)
				var _root = _getRoot(epics,_e.Number)
				if (_root && !_.findWhere(_initiatives,{Number:_root.Number})){
					_initiatives.push(_root);
				}
			}
			else if (!_.findWhere(_initiatives,{Number:_e.Number})){
				_initiatives.push(_e);
			}
		}

		var _cleaned = [];
		// and now we flatten to "Planning Epics" as children only
		for (var i in _initiatives){
			if (_initiatives[i].Status=="Conception" || _initiatives[i].Status=="Understanding" || _initiatives[i].Status=="Implementation"){
				_initiatives[i].PlanningEpics = _getPlanningEpics(_initiatives[i]);
				_cleaned.push(_initiatives[i]);
			}
		}



		callback(err,_.where(_cleaned,{PortfolioApproval:"Yes"}));
		//callback(err,_.where(epics,{CategoryName:"Initiative"}));
	})
}

function _getRoot(epics,number){
	var _e = _.findWhere(epics,{Number:number});
	if (!_e) return;
	if (_e.EpicRootNumber){
		return _getRoot(epics,_e.EpicRootNumber)
	}
	else{
		logger.debug("...no more root found - so this seems to be the real root :-)  "+number)
		return _e;
	}
}

/** collects all epics type Planning in a parent child three
*/
function _getPlanningEpics(epic){
	logger.debug("--------------------------------- get planning epics for: "+epic.Name+" ---------------------------------------------------------");
	var _planningepics=[];
	if (epic.Children){
		logger.debug("---------------"+epic.Children.length+" children!")
		for (var c in epic.Children){
			var _child = epic.Children[c];
			if (_child.CategoryName==="Planning" && !_child.Children){
				logger.debug("--------------pushing to planning epics !" +_child.CategoryName);
				_planningepics.push(_child);
			}
			else if (_child.Children){
				logger.debug("*********** OK child has children ;-)..."+_child.Children.length);
				for (var cc in _child.Children){
					var _ccchild = _child.Children[cc];
					if (_ccchild.CategoryName==="Planning"){
						logger.debug("----------____________________________----pushing to planning epics !"+_ccchild.CategoryName);
						_planningepics.push(_ccchild);
					}
				}
			}
		}
	}
	return _planningepics;
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
			if (new Date(_in.PlannedStart)>=start && _in.Product) _roadmap.push(_in);
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
