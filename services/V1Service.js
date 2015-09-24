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
exports.getPlanningInitiatives = _getPlanningInitiatives;

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
function _findPlanningBacklogs(callback) {
	var _filter = {Name:/#cpb/};
	_findBacklogs(_filter,callback);
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
	_findPlanningBacklogs(function(err,planningbacklogs){
		_findTeams({},function(err,teams){
			_findInitiativesWithPlanningEpics(filter,function(err,epics){
				var _backlogs = _getBacklogsFromInitiativesWithPlanningEpics(epics,planningbacklogs);

				//


				var _result = _buildBacklogResult(_backlogs,teams);
				callback(null,_result);
			});
		});
	});
}

function _getPlanningInitiatives(filter,callback){
	_findTeams({},function(err,teams){
		_findInitiativesWithPlanningEpics(filter,function(err,epics){
			//var _backlogs = _getBacklogsFromInitiativesWithPlanningEpics(epics);
			var _result = _buildInitiativeResult(epics,teams);
			callback(null,_result);
		});
	});
}


function _buildInitiativeResult(initiatives){
	var _totalSwag=0;
	var _totalSwagRemaining=0;
	var _totalPlanningEpics=0;

	for (var i in initiatives){
		var _i = initiatives[i];
		_totalPlanningEpics+=_i.PlanningEpics.length;
		var _swagSum=0;
		var _swagSumRemaining=0;
		var _startDates = [];
		var _endDates = [];

		var _progress = 0;
		for (var p in _i.PlanningEpics){
			var _p = _i.PlanningEpics[p];
			var _swagRemaining = 0;
			_swagSum+=parseInt(_p.Swag);
			if (_p.Progress){
				_swagRemaining = parseFloat((parseInt(_p.Swag)*(1-(_p.Progress/100))).toFixed(2));
			}
			else{
				_p.Progress=0;
				_swagRemaining = _p.Swag;
			}
			_p.SwagRemaining=_swagRemaining;
			_swagSumRemaining+=_swagRemaining;

			if (_p.PlannedStart) _startDates.push(_p.PlannedStart);
			if (_p.PlannedEnd) _endDates.push(_p.PlannedEnd);
		}
		//overwrite initiative attributes with planned from below epics
		_i.PlannedStartInitiative = _i.PlannedStart;
		_i.PlannedEndInitiative = _i.PlannedEnd
		_i.PlannedStart = _.first(_startDates.sort());
		_i.PlannedEnd = _.first(_endDates.sort());
		_i.SwagPlanned = _swagSum;
		if (_swagSum !=0)
			_i.ProgressPlanned = ((1-(_swagSumRemaining/_swagSum))*100).toFixed(2);
		else
			_i.ProgressPlanned =0;

		_i.SwagRemaining = _swagSumRemaining;
		_totalSwag+=_swagSum;
		_totalSwagRemaining+=parseFloat(_swagSumRemaining);
	}
	return({initiatives:initiatives,statistics:{totalSwag:_totalSwag,totalSwagRemaining:_totalSwagRemaining,totalPlanningEpics:_totalPlanningEpics}})
}
function _buildBacklogResult(_backlogs,teams){
	var _statussorting = ["Implementation","Conception","Understanding"];

	var _totalSwag =0;
	var _totalSwagRemaining =0;

	var _totalPlanningEpics =0;
	var _totalInitiatives =0;
	var _totalMembers =0;
	var _totalTeams =0;

	var _initiatives=[];
	var _planningEpics=[];

	for (var b in _backlogs){
		var _backlogSwag=0;
		var _backlogSwagRemaining=0;
		//var _backlogPlanningEpics=0;
		var _b=_backlogs[b];

		var _iResult = _buildInitiativeResult(_b.Initiatives);

		_backlogSwag+=_iResult.statistics.totalSwag;
		_backlogSwagRemaining+=_iResult.statistics.totalSwagRemaining;

		_totalSwag+=_iResult.statistics.totalSwag;
		_totalSwagRemaining+=_iResult.statistics.totalSwagRemaining;

		_b.Initiatives=_.sortBy(_backlogs[b].Initiatives,function(i){return _statussorting.indexOf(i.Status)});
		_b.Members = _getMembersPerPlanningBacklog(_b.Name,teams);
		_b.TotalSwag = _iResult.statistics.totalSwag;
		_b.TotalSwagRemaining = _backlogSwagRemaining;
		_b.Capacity.AvailablePDperMonth = _b.Capacity.PDperMonth*_b.Members.length;

		_b.Capacity.AvailablePDperMonthForInitiatives= _b.Capacity.AvailablePDperMonth *_b.Capacity.defaultAvailableForInitiativesRatio;
		_totalMembers+=_b.Members.length;
		_totalTeams+=_.uniq(_.map(_b.Members,'Team')).length;

		_initiatives=_.union(_initiatives,_.map(_b.Initiatives,"Number"));

		_totalPlanningEpics+=_iResult.statistics.totalPlanningEpics;
		_b.TotalPlanningEpics =_iResult.statistics.totalPlanningEpics
	}

	_totalInitiatives = _.uniq(_initiatives).length;

	var _statistics =  {totalSwag:_totalSwag,totalSwagRemaining:_totalSwagRemaining,totalPlanningEpics:_totalPlanningEpics,totalInitiatives:_totalInitiatives,totalMembers:_totalMembers,totalTeams:_totalTeams};
	return{backlogs:_backlogs,statistics:_statistics};
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

/**
helper
*/
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
			var _i = _initiatives[i];
			if (_i.Status=="Conception" || _i.Status=="Understanding" || _i.Status=="Implementation"){
				_i.PlanningEpics = _getPlanningEpics(_i);
				// and setting real root for planning epics
				for (var p in _i.PlanningEpics){
					_i.PlanningEpics[p].InitiativeRootName = _i.Name;
					_i.PlanningEpics[p].InitiativeRootNumber = _i.Number;
					_i.PlanningEpics[p].InitiativeRootStatus = _i.Status;
				}
				_cleaned.push(_initiatives[i]);
			}
		}
		callback(err,_.where(_cleaned,{PortfolioApproval:"Yes"}));
	})
}

/** extracts the backlog field and groups around this
*/
function _getBacklogsFromInitiativesWithPlanningEpics(initiativesWithPlanningEpics,planningbacklogs){
	var _backlogs = [];
	_backlogs = _extractBacklogs(initiativesWithPlanningEpics);
	_backlogs = _enrichCapacityPerBacklog(_backlogs,planningbacklogs)
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
				if (!_.findWhere(_backlogs,{ID:_p.BusinessBacklogID})){
					_backlogs.push({Name:_p.BusinessBacklog,ID:_p.BusinessBacklogID})
				}
			}
		}
	}
	return _backlogs;
}

function _enrichCapacityPerBacklog(backlogs,planningbacklogs){
	var _capacityConfig={PDperMonth:config.backlogs.PDperMonth,defaultProductiveWorkRatio:config.backlogs.defaultProductiveWorkRatio,defaultAvailableForInitiativesRatio:config.backlogs.defaultAvailableForInitiativesRatio};
	for (var b in backlogs){
		var _b = backlogs[b];
		_b.Capacity=_capacityConfig;
		_b.Initiatives=[];
	}

	// and join the empty backlogs
	for (var p in planningbacklogs){
		var _p = planningbacklogs[p];
		if (!_.findWhere(backlogs,{Name:_p.Name})){
			_p.Capacity=_capacityConfig;
			_p.Initiatives=[];
			backlogs.push(_p);
		}
	}
	return backlogs;
}

function _repopulateBacklogs(backlogs,initiativesWithPlanningEpics){
	// now put the initiatives back in
	var _ini0 = _.map(initiativesWithPlanningEpics,'Number');
	var _ini1 = [];

	var _count=0;
	for (var b in backlogs){
		var _b = backlogs[b];
		for (var i in initiativesWithPlanningEpics){
			var _i = initiativesWithPlanningEpics[i];
			if (_i.PlanningEpics){
				_i.PlanningBacklog=_b.Name;
				_i.PlanningBacklogID=_b.ID;
				_i.Product = _deriveProductFromBacklog(_b.Name);

				for (var p in _i.PlanningEpics){
					var _p = _i.PlanningEpics[p];
					if (_p.BusinessBacklogID==_b.ID){
						if (!_.findWhere(_b.Initiatives,{Name:_i.Name})){
							_b.Initiatives.push(_.cloneDeep(_i));
							_count++;
							_ini1.push(_i.Number);
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
	var _planningepics;
	if (!planningepics){
		_planningepics=[];
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
