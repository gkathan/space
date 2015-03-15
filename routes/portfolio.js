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

router.get('/', function(req, res) {
	// join pgates with epics
	var pgates =  db.collection('portfoliogate');
	var initiatives = db.collection('v1epics');
		
	/* find and mark deltas 		
	=> if we have 3 snapshots (dates) online 
	=> we will have 2 deltas to calculate
		for every state 
			for every item
				check item.STATE from previous date 
				if (==) nothing
				if (!) mark and add previous state 
	*/
	pgates.find().sort({pDate:-1}, function (err, docs){
	var _gates = docs;
	// find all initiatives which have ExtNumber set 
	//initiatives.find({ExtNumber:{$exists:1}},function (err,docs){
	initiatives.find({},function (err,docs){
	var _initiatives = docs[0].epics;
	var _V1lastUpdate = docs[0].createDate;
	// and lets join some data :-)
	logger.debug("===================== initiatives: "+_initiatives);
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
		
		_gates[_date]["stateChangeBucket"]=_stateChangeBucket;
		_gates[_date]["healthChangeBucket"]=_healthChangeBucket;
		_gates[_date].pDate=moment(_gates[_date].pDate).format('LL');
		_gates[_date].pBoardDate=moment(_gates[_date].pBoardDate).format('LL');
		logger.debug("----------------------------------------------------------------"+_gates[_date].pDate);
		// sort the states by 
		// NEW -> UNDERSTANDING -> CONCEPTION -> IMPLEMENTATION -> MONITORING -> CLOSED
		// pg state
		for (var _state in _gates[_date].pItems){
			//console.log("?????????????????? _color: "+_gates[_date].pItems[_state].color);
			//console.log("?????????????????? JSON: "+JSON.stringify(_gates[_date].pItems[_state]));
			for (var _ref in _gates[_date].pItems[_state]){
				var _epic = _gates[_date].pItems[_state][_ref];
				var _item = _initiatives.filter(function( obj ) {
				  return obj.Number == _epic.EpicRef;
				});
				// and enrich
				//logger.debug("***** checking gate: "+ggg+" - "+_gate.EpicRef);
				//logger.debug"******* against initiative: "+_item[0]);
				
				if (_item[0]) {
					_epic["name"] = _item[0].Name;
					
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
				
				
				// v1 epic.ID comes in format Epic:2783462387
				if (_item[0]) {_epic["id"] = _item[0].ID.split(":")[1];}
				
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
				}
			}
			// and now lets sort the array
			logger.debug("array[0]: "+_gates[_date].pItems[_state][0].id);
			// sort by id
			//_.map(_.sortByAll(_gates[_date].pItems[_state],['EpicRef']),_.values);
			
			
			
			//_gates[_date].pItems[_state].sort(function(a,b){return b.id - a.id; });
			
			
			
			// sort by swag
			//_gates[_date].pItems[_state].sort(function(a,b){return b.swag - a.swag; });
			// sort by health
			
			_gates[_date].pItems[_state].sort(function(a,b){
				console.log("-------------------- sorting by health: a.health: "+a.Health+" b.health: "+b.Health);
				if (a.HealthRank<b.HealthRank) return 1;
				else if (a.HealthRank>b.HealthRank) return -1;
				else return 0
				
				});
			
			//_gates[_date].pItems[_state].sort();
			}
		}
		res.locals.pgates=_gates;
		res.locals.colors=_color;
		res.locals.v1LastUpdate=_V1lastUpdate;
		

		res.render('portfoliogate'), { title: 's p a c e - portfoliogate' }
		});
	});
});



/**
 * @param array of EpicAttachments (_item[0].EpicAttachments);
 * @param array of EpicAttachmentsName (_item[0].EpicAttachmentNames)
 * 
 * 
 * @return collection of attachement data [{type:"Proposal",oid:823749283},{type:"Closing",oid:28374382},{type:"Scope",oid:28975}
 */
function _parseAttachments(_epicAttachments, _epicAttachmentNames){
	var _attachments = [];
	
	var _oids = _parseAttachmentOIDs(_epicAttachments);
	console.log("_oids length:"+_oids.length)
	
	var _names = _parseAttachmentNames(_epicAttachmentNames);
	console.log("_names length:"+_names.length)
	
	for (var i=0; i<_oids.length;i++){
		console.log("* constructing...."+i)
		
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
