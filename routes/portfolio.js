var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongojs = require('mongojs');
var moment = require('moment');
var _ = require('lodash');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

module.exports = router;

router.get('/planningepics', function(req, res) {
	var v1Service = require('../services/V1Service');
	var _filter = {};
	v1Service.findInitiativesWithPlanningEpics(_filter,function(err,epics){
		var _swagSum=0;;
		var _valueSum=0;;
		var _riskSum=0;;
		for (var e in epics){
			var _e = epics[e];
			for (var p in _e.PlanningEpics){
				var _p = _e.PlanningEpics[p];
				_swagSum+=parseInt(_p.Swag);
			}

			_valueSum+=parseInt(epics[e].Value);
			_riskSum+=parseInt(epics[e].Risk);
		}
		var _grouped = _.groupBy(epics,'Status');

		res.locals.grouped = _grouped;
		res.locals.statistics={swagSum:_swagSum,averageSwag:_swagSum/epics.length,valueSum:_valueSum,averageValue:_valueSum/epics.length,riskSum:_riskSum,averageRisk:_riskSum/epics.length}
		res.locals.initiatives = epics;
		res.locals.moment=moment;
		res.render('portfolio/planningepics'), { title: 's p a c e - planning epics overview ' }
	});
});

router.get('/planningbacklogs', function(req, res) {
	var v1Service = require('../services/V1Service');
	var _filter = {};

	v1Service.getPlanningBacklogs(_filter,function(err,result){
		res.locals.backlogs = _.sortBy(result.backlogs,'Name');
		res.locals.totalSwag = result.statistics.totalSwag;
		res.locals.moment=moment;
		res.render('portfolio/planningbacklogs'), { title: 's p a c e - planning backlogs overview ' }
	})
});

router.get('/planningbacklogdetail/:name', function(req, res) {
	var _backlogname = req.params.name+"#cpb";
	var v1Service = require('../services/V1Service');
	var _filter = {};

	v1Service.getPlanningBacklogs(_filter,function(err,result){
		var _backlog = _.findWhere(result.backlogs,{Name:_backlogname});
		res.locals.backlog = _backlog;
		res.locals.members = _backlog.Members;
		res.locals.moment=moment;
		res.render('portfolio/planningbacklogdetail'), { title: 's p a c e - planning backlog detail' }
	});
});

router.get('/', function(req, res) {
	// join pgates with epics
	var pgates =  db.collection('portfoliogate');
	var v1Service = require('../services/V1Service');
	var syncService =require('../services/SyncService');
	/* find and mark deltas
	=> if we have 3 snapshots (dates) online
	=> we will have 2 deltas to calculate
		for every state
			for every item
				check item.STATE from previous date
				if (==) nothing
				if (!) mark and add previous state
	*/
	pgates.find().limit(config.portfolio.gatesLimit).sort({pDate:-1}, function (err, docs){
	var _gates = docs;

	// the lifecycle of an initiative
	var _states = ["New","Understanding","Conception","Implementation","Monitoring","On hold","Cancelled","Done"];
	// find all initiatives which have ExtNumber set
	//initiatives.find({ExtNumber:{$exists:1}},function (err,docs){
	v1Service.findEpics(function (err,docs){
		syncService.getLastSync("v1epics",function(err,sync){
		var _initiatives = docs;
		var _V1lastUpdate = sync.lastSync;
		// set colors
		var _color ={};
		_color["Understanding"] = "#aaaaaa";
		_color["Conception"] = "#999999";
		_color["Implementation"] = "#666666";
		_color["Monitoring"] = "#333333";
		_color["Closed"] = "#000000";
		_color["On hold"] = "#cccccc";
		// pg dates
		for (var _date in _gates){
			//collect the changed items per date in a bucket for later display
			var _stateChangeBucket=[];
			var _healthChangeBucket=[];
			// the ones which were dealed with in portfolioboard (PB==1)
			var _portfolioBoardBucket=[];
			var _targetContributionBucket={};

			_gates[_date]["stateChangeBucket"]=_stateChangeBucket;
			_gates[_date]["healthChangeBucket"]=_healthChangeBucket;
			_gates[_date]["portfolioBoardBucket"]=_portfolioBoardBucket;
			_gates[_date].pDate=moment(_gates[_date].pDate).format('LL');
			_gates[_date].pBoardDate=moment(_gates[_date].pBoardDate).format('LL');

			_gates[_date]["targetContributionBucket"]=_targetContributionBucket;

			// sort the states by
			// NEW -> UNDERSTANDING -> CONCEPTION -> IMPLEMENTATION -> MONITORING -> CLOSED
			// pg state
			for (var _state in _gates[_date].pItems){
				if (!_gates[_date]["targetContributionBucket"][_state]) _gates[_date]["targetContributionBucket"][_state] = [];

				for (var _ref in _gates[_date].pItems[_state]){
					var _epic = _gates[_date].pItems[_state][_ref];
					var _item = _initiatives.filter(function( obj ) {
					  return obj.Number == _epic.EpicRef;
					});
					// and enrich
					if (_item[0]) {
						_epic["id"] = _item[0].ID.split(":")[1];
						_epic["name"] = _item[0].Name;
						_epic["value"] = _item[0].Value;
						_epic["risk"] = _item[0].Risk;
						_epic["product"] = _item[0].Product;


						if (_item[0].Markets){
							_epic["markets"] = _item[0].Markets;
						}
						if (_item[0].Customers){
							_epic["customers"] = _item[0].Customers;
						}

						if (_item[0].Targets){
							_epic["targets"] = _item[0].Targets;
							var _targets=_epic["targets"];

							for (var t in _targets){
									if (!_gates[_date]["targetContributionBucket"][_state][_targets[t]]){
										_gates[_date]["targetContributionBucket"][_state][_targets[t]]={count:0,swag:0,epics:[]};
									}
									_gates[_date]["targetContributionBucket"][_state][_targets[t]].count++;
									_gates[_date]["targetContributionBucket"][_state][_targets[t]].swag+=_item[0].Swag;

									_gates[_date]["targetContributionBucket"][_state][_targets[t]].epics.push(_epic.EpicRef+"_"+moment(_gates[_date].pDate).format("YYYY-MM-DD"));
							}
						}
	 					// stuff needed for sorting
						if (_epic.Health=="Green") _epic["HealthRank"]=1;
						else if (_epic.Health=="Amber") _epic["HealthRank"]=2;
						else if (_epic.Health=="Red") _epic["HealthRank"]=3;
						else if (_epic.Health==undefined) _epic["HealthRank"]=0;
						var _attachments = _parseAttachments(_item[0].EpicAttachments,_item[0].EpicAttachmentNames);

						_epic["attachmentProposal"]=_.find(_attachments,function(d){return d.type=="proposal";})
						_epic["attachmentClosing"]=_.find(_attachments,function(d){return d.type=="closing";})
					}
					else _epic["name"] = "<not synced>";

					// and now check whether something changed since last date
					// do not check for last date - as there is nothing to check against ;-)
					if (_date < _gates.length-1){
						var _dd = parseInt(_date)+1;
						var _compare = _findItemByDateandRef(_gates[_dd].pItems,_epic.EpicRef);
						// 1) check status change
						if (_compare ==undefined || _compare.Status != _epic.Status){
							if (_compare ==undefined){
								 _epic["oldState"]="New";
							 }
							else{
								 _epic["oldState"]=_compare.Status;
							 }
							// and collect those items in a bucket...
							_stateChangeBucket.push(_epic);
						}
						// 2) health changes
						if (_compare != undefined && _compare.Health != _epic.Health){
							 _epic["oldHealth"]=_compare.Health;
							// and collect those items in a bucket...
							_healthChangeBucket.push(_epic);
						}
						//3) PB items
						if (_epic.PB){
							_portfolioBoardBucket.push(_epic);
						}
					}
				}
				// and now lets sort the array
				//logger.debug("array[0]: "+_gates[_date].pItems[_state][0].id);
				_gates[_date].pItems[_state].sort(function(a,b){
					if (a.HealthRank<b.HealthRank) return 1;
					else if (a.HealthRank>b.HealthRank) return -1;
					else return 0
				});
				// and sort the items by state lifecycle
				}
			}
			//slogger.debug("---------------------------------------- targetContributionBucket: "+JSON.stringify(_gates));
			res.locals.pgates=_gates;
			res.locals.moment=moment;
			res.locals.states=_states;
			res.locals.colors=_color;
			res.locals.v1LastUpdate=_V1lastUpdate;
			res.render('portfolio/portfoliogate'), { title: 's p a c e - portfoliogate' }
			});
		});
	});
});

/**
 * @param array of EpicAttachments (_item[0].EpicAttachments);
 * @param array of EpicAttachmentsName (_item[0].EpicAttachmentNames)
 * @return collection of attachement data [{type:"Proposal",oid:823749283},{type:"Closing",oid:28374382},{type:"Scope",oid:28975}
 */
function _parseAttachments(_epicAttachments, _epicAttachmentNames){
	var _attachments = [];
	var _oids = _parseAttachmentOIDs(_epicAttachments);
	var _names = _parseAttachmentNames(_epicAttachmentNames);

	for (var i=0; i<_oids.length;i++){
		var _attachment = {};
		_attachment["type"]=_names[i];
		_attachment["oid"]=_oids[i];
		_attachments.push(_attachment);
	}
	return _attachments;
}



/**
 * @param _attachment: "EpicAttachments":"[{_oid\u003dAttachment:6439285}, {_oid\u003dAttachment:6439339}]"
 *
 * @return: array of OIDs
 */
function _parseAttachmentOIDs(_attachment){
	var _ids = [];
	if (_attachment != undefined){
		var _split1 = _attachment.split(",");
		for (var i in _split1){
			var _split2 = _split1[i].split(":");
			if (_split2[1] != undefined){
				var _id = _split2[1].split("}")[0];
				_ids.push(_id);
			}
		}
	}
	return _ids;
}


/**
 * @param _attachmentName: "EpicAttachmentNames":"[Scope for closure, IP for closure]"},
 *
 * @return: array of names
 */
function _parseAttachmentNames(_attachmentName){
	var _names = [];
	if (_attachmentName != undefined){
		var _split1 = _attachmentName.split(",");
		for (var i in _split1){
			// strip out the brackets
			var _name = _split1[i].replace("[","").replace("]","");
			var _type="";
			// and now check for patterns
			if (_name.toLowerCase().indexOf("closing")>=0) _type = "closing";
			else if (_name.toLowerCase().indexOf("proposal")>=0) _type = "proposal";
			else if (_name.toLowerCase().indexOf("scope")>=0) _type = "scope";
			_names.push(_type);
		}
	}
	return _names;
}

/**
 * helper for delta check to find an item by EpicRef for a given date
 */
function _findItemByDateandRef(items,ref){
	for (var _state in items){
		for (var _ref in items[_state]){
			if (items[_state][_ref].EpicRef==ref) return items[_state][_ref];
		}
	}
}
