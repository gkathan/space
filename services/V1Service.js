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
			var _e =_.sortBy(docs[0].epics, "Number")
			callback(err,_e);
			return;
	});
}

function _findInitiativeEpics(callback) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(_.where(docs[0].epics,{CategoryName:"Initiative"}), "Number")
			callback(err,_e);
			return;
	});
}

function _findPortfolioApprovalEpics(callback) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(_.where(docs[0].epics,{PortfolioApproval:"Yes"}), "Number")
			callback(err,_e);
			return;
	});
}

function _getRoadmapInitiatives(start,callback){
	_findInitiativeEpics(function (err,initiatives){
		var _roadmap = [];
		for (var i in initiatives){
			var _in=initiatives[i];
			if (new Date(_in.PlannedStart)>=start && _in.StrategicThemesNames!="[]" ) _roadmap.push(_in);

			// map the "Product"
			if (_in.BusinessBacklog.indexOf("Studios")>-1) _in.Product="Studios";
			else if(_in.BusinessBacklog.indexOf("Casino")>-1) _in.Product="Casino";
			else if(_in.BusinessBacklog.indexOf("Compliance")>-1) _in.Product="Compliance";
			else if(_in.BusinessBacklog.indexOf("Core Services")>-1) _in.Product="Core Services";
			else if(_in.BusinessBacklog.indexOf("CRM Services")>-1) _in.Product="CRM Services";
			else if(_in.BusinessBacklog.indexOf("[DTP]")>-1) _in.Product="Portal";
			else if(_in.BusinessBacklog.indexOf("Payments")>-1) _in.Product="Payments";
			else if(_in.BusinessBacklog.indexOf("Poker")>-1) _in.Product="Poker";
			else if(_in.BusinessBacklog.indexOf("Sports POS")>-1) _in.Product="Sports";
			else if(_in.BusinessBacklog.indexOf("[TCS")>-1) _in.Product="Sports Content, Trading & security";



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
			var _e =docs[0].epics;
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
