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


exports.deriveProductFromBacklog=_deriveProductFromBacklog;

exports.findTeams=_findTeams;
exports.findEpics=_findEpics;
exports.findBacklogs=_findBacklogs;
exports.findMembers=_findMembers;

exports.findEpicsWithChildren=_findEpicsWithChildren;
exports.findInitiativesWithPlanningEpics = _findInitiativesWithPlanningEpics;
exports.findInitiativeEpics=_findInitiativeEpics;
exports.findPortfolioApprovalEpics=_findPortfolioApprovalEpics;
exports.getRoadmapInitiatives=_getRoadmapInitiatives;
exports.getRoot=_getRoot;
exports.getPlanningEpics=_getPlanningEpics;
exports.getBacklogsFromInitiativesWithPlanningEpics=_getBacklogsFromInitiativesWithPlanningEpics;
exports.getMembersPerPlanningBacklog = _getMembersPerPlanningBacklog;
exports.getPlanningBacklogs = _getPlanningBacklogs;
exports.getPlanningBacklogsByEpics = _getPlanningBacklogsByEpics;
exports.getPlanningBacklogsByInitiatives = _getPlanningBacklogsByInitiatives;





function _deriveProductFromBacklog(backlog){
	var _product = "";
	// map the "Product"
	if (backlog){
		if (backlog.indexOf("Studios")>-1) _product="Studios";
		else if(backlog.indexOf("Casino")>-1 || _.startsWith("[CAS")) _product="Casino";
		else if(backlog.indexOf("Compliance")>-1 || _.startsWith("[COM")) _product="Compliance";
		else if(backlog.indexOf("Core Services")>-1 || _.startsWith("[COR")) _product="Core Services";
		else if(backlog.indexOf("CRM Services")>-1 || _.startsWith("[CRM")) _product="CRM Services";
		else if(backlog.indexOf("[DTP")>-1) _product="Portal";
		else if(backlog.indexOf("Payments")>-1 || _.startsWith("[PAY")) _product="Payments";
		else if(backlog.indexOf("Poker")>-1 || _.startsWith("[POK")) _product="Poker";
		else if(backlog.indexOf("Sports POS")>- 1 || _.startsWith("[SPO")) _product="Sports";
		else if(backlog.indexOf("[TCS")>-1) _product="Sports Content, Trading & security";
	}
	return _product
}

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
/**
 * find all Teams
 */
function _findTeams(filter,callback) {
	var teams =  db.collection('v1teams');
		teams.find(filter, function (err, result){
			callback(err,result);
			return;
	});
}

/**
 * find all Members
 */
function _findMembers(filter,callback) {
	var members =  db.collection('v1members');
		members.find(filter, function (err, result){
			callback(err,result);
			return;
	});
}


/**
 * find all Backlogs
 */
function _findBacklogs(filter,callback) {
	var backlogs =  db.collection('v1backlogs');
		backlogs.find(filter, function (err, result){
			callback(err,result);
			return;
	});
}

/**
 * find all Programs
 */
function _findPrograms(filter,callback) {
	var programs =  db.collection('v1programs');
		backlogs.find(filter, function (err, result){
			callback(err,result);
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


function _getPlanningBacklogs(filter,callback){
	var _statussorting = ["Implementation","Conception","Understanding"];
	_findTeams({},function(err,teams){
		_findInitiativesWithPlanningEpics(filter,function(err,epics){
			var _backlogs = _getBacklogsFromInitiativesWithPlanningEpics(epics);
			// and sort the initiatives
			var _totalSwag =0;
			var _totalPlanningEpics =0;
			var _totalInitiatives =0;
			var _totalMembers =0;
			var _totalTeams =0;

			for (var b in _backlogs){
				var _backlogSwag=0;
				var _backlogPlanningEpics=0;
				_totalInitiatives+=parseInt(_backlogs[b].Initiatives.length);
				for (var i in _backlogs[b].Initiatives){
					var _i = _backlogs[b].Initiatives[i]
					var _swagSum=0;
					var _startDates = [];
					var _endDates = [];
					for (var p in _i.PlanningEpics){
						var _p = _i.PlanningEpics[p];
						_swagSum+=parseInt(_p.Swag);
						_backlogPlanningEpics++;
						if (_p.PlannedStart) _startDates.push(_p.PlannedStart);
						if (_p.PlannedEnd) _endDates.push(_p.PlannedEnd);
					}
					//overwrite initiative attributes with planned from below epics
					_i.PlannedStartInitiative = _i.PlannedStart;
					_i.PlannedEndInitiative = _i.PlannedEnd
					_i.PlannedStart = _.first(_startDates.sort());
					_i.PlannedEnd = _.last(_endDates.sort());
					_i.SwagPlanned = _swagSum;
					_backlogSwag+=_swagSum;
				}
				_totalSwag+=_swagSum;
				_totalPlanningEpics+=_backlogPlanningEpics;

				_backlogs[b].Initiatives=_.sortBy(_backlogs[b].Initiatives,function(i){return _statussorting.indexOf(i.Status)});
				_backlogs[b].Members = _getMembersPerPlanningBacklog(_backlogs[b].Name,teams)
				_backlogs[b].TotalSwag = _backlogSwag;
				_backlogs[b].TotalPlanningEpics = _backlogPlanningEpics;
				_totalMembers+=_backlogs[b].Members.length;
				_totalTeams+=_.uniq(_.map(_backlogs[b].Members,'Team')).length;
			}
			callback(null,{backlogs:_backlogs,statistics:{totalSwag:_totalSwag,totalPlanningEpics:_totalPlanningEpics,totalInitiatives:_totalInitiatives,totalMembers:_totalMembers,totalTeams:_totalTeams}});
		});
	});
}


function _getPlanningBacklogsByEpics(filter,callback){
	_getPlanningBacklogs(filter,function(err,result){
		var _planningepics = _extractPlanningEpicsFromBacklogs(result.backlogs);
		callback(null,_planningepics);
	})
}

function _getPlanningBacklogsByInitiatives(filter,callback){
	_getPlanningBacklogs(filter,function(err,result){
		var _initiatives = _extractInitiativesFromBacklogs(result.backlogs);
		callback(null,_initiatives);
	})
}

/**
helper
*/
function _extractPlanningEpicsFromBacklogs(backlogs){
	var _planningepics=[];
	for (var b in backlogs){
		var _b = backlogs[b];
		for(var i in _b.Initiatives){
			_planningepics=_.union(_planningepics,_b.Initiatives[i].PlanningEpics);
		}
	}
	return _planningepics;
}
function _extractInitiativesFromBacklogs(backlogs){
	var _initiatives=[];
	for (var b in backlogs){
		var _b = backlogs[b];
		_initiatives=_.union(_initiatives,_b.Initiatives);
	}
	return _initiatives;
}



/** this is for peter :-)
* collects all initiatives and puts planning epics as children*
*/
// ,{"PortfolioApproval":"Yes"}
function _findInitiativesWithPlanningEpics(filter,callback){
	var _prefilter = {$and:[{$or:[{CategoryName:"Initiative"},{CategoryName:"Planning"},{CategoryName:"Product Contribution"}]},{IsClosed:false}]};
	_findEpicsWithChildren(_prefilter,function(err,epics){
		var _initiatives = [];
		for (var e in epics){
			var _e = epics[e];
			if (_e.EpicRootNumber){
				// needs to be recusrsive.....
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
	})
}

/** extracts the backlog field and groups around this
*/
function _getBacklogsFromInitiativesWithPlanningEpics(initiativesWithPlanningEpics){
	var _backlogs = [];
	_backlogs = _extractBacklogs(initiativesWithPlanningEpics);
	_backlogs = _repopulateBacklogs(_backlogs,initiativesWithPlanningEpics);
	_backlogs = _filterPlanningEpics(_backlogs);
	return _backlogs;
}

function _extractBacklogs(initiativesWithPlanningEpics){
	var _backlogs = [];
	// first lets build up the distinct backlog collection
	for (var i in initiativesWithPlanningEpics){
		var _i = initiativesWithPlanningEpics[i];
		if (_i.PlanningEpics){
			for (var p in _i.PlanningEpics){
				var _p = _i.PlanningEpics[p];
				if (!_.findWhere(_backlogs,{Name:_p.BusinessBacklog})){
					_backlogs.push({Name:_p.BusinessBacklog,Initiatives:[]})
				}
			}
		}
	}
	return _backlogs;
}

function _repopulateBacklogs(backlogs,initiativesWithPlanningEpics){
	// now put the initiatives back in
	for (var b in backlogs){
		var _b = backlogs[b];
		for (var i in initiativesWithPlanningEpics){
			var _i = initiativesWithPlanningEpics[i];
			if (_i.PlanningEpics){
				_i.PlanningBacklog=_b.Name;
				_i.Product = _deriveProductFromBacklog(_b.Name);
				for (var p in _i.PlanningEpics){
					var _p = _i.PlanningEpics[p];
					if (_p.BusinessBacklog==_b.Name){
						if (!_.findWhere(_b.Initiatives,{Name:_i.Name})){
							_b.Initiatives.push(_.cloneDeep(_i));
						}
					}
				}
			}
		}
	}
	return backlogs;
}

function _filterPlanningEpics(backlogs){
	// and filter planning epics
	for (var b in backlogs){
		var _b = backlogs[b];
		for (var i in _b.Initiatives){
			var _i = _b.Initiatives[i];
			var _filtered=[];
			if (_i.PlanningEpics){
				for (var p in _i.PlanningEpics){
					var _p = _i.PlanningEpics[p];
					if (_p.BusinessBacklog == _b.Name){
						_p.PlanningBacklog=_b.Name;
						_filtered.push(_p);
					}
				}
				if (_filtered.length>0){
					_i.PlanningEpics=_filtered;
				}
			}
		}
	}
	return backlogs;
}


function _getRoot(epics,number){
	var _e = _.findWhere(epics,{Number:number});
	if (!_e) return;
	if (_e.EpicRootNumber){
		return _getRoot(epics,_e.EpicRootNumber)
	}
	else{
		return _e;
	}
}


/** collects all epics type Planning in a parent child three
*/
function _getPlanningEpics(epic,planningepics){
	if (!planningepics){
		var _planningepics=[];
	}
	else{
		_planningepics = planningepics;
	}
	if (epic.Children){
		for (var c in epic.Children){
			var _child = epic.Children[c];
		 	_getPlanningEpics(_child,_planningepics);
		}
		return _planningepics;
	}
	else{
		if (epic.CategoryName==="Planning" && !epic.Children && epic.BusinessBacklog.indexOf("#cpb")>-1){
				_planningepics.push(epic);
		}
		return _planningepics;
	}
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


function _getMembersPerPlanningBacklog(backlog,teams){
	var _membersPerBacklog=[];
	var _teams = _.where(teams,{Backlog:backlog});

	for (var t in _teams){
		var _t = _teams[t];
		var _participants=_t.Participants;
		for (var p in _participants){
			_participants[p].Team=_t.Name;
			_membersPerBacklog.push(_participants[p]);
		}
	}
	return _membersPerBacklog;
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
