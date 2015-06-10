/**
* service which syncs on a scheduled basis with the configured prioity  incidents from snow API
**/
var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');
var moment = require('moment');
var jsondiffpatch=require('jsondiffpatch');
var app=require('../app');
var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);
// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var _syncName = "incidents";
var incService = require('./IncidentService');
var incTrackerService = require('./IncidentTrackerService');

var _secret = require("../config/secret.json");
var Client = require('node-rest-client').Client;

exports.init = function(callback){
	var rule = new schedule.RecurrenceRule();
	// every 10 minutes
	rule.minute = new schedule.Range(0, 59, config.sync[_syncName].intervalMinutes);
	logger.info("[s p a c e] IncidentSyncService init(): "+config.sync[_syncName].intervalMinutes+" minutes - mode: "+config.sync[_syncName].mode);
	if (config.sync[_syncName].mode!="off"){
		var j = schedule.scheduleJob(rule, function(){
			logger.debug('...going to sync Incident stuff ....');
			var _url = config.sync[_syncName].url;
			var _type = "scheduled - automatic";
			_sync(_url,_type,callback);
		});
	}
}

<exports.sync = _sync;

function _sync(url,type,callback){
	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

	url+="&sysparm_query=priority<="+config.sync[_syncName].includePriority+"^active=true";
	logger.debug("...snow API call url: "+url);
	_getSnowData(url,function(err,data){
		// parsed response body as js object
		logger.debug("[_syncIncident]...client.get data..: _url:"+url);
    var _incidentsNEW=[];
    var _incidentsOLD;
		// lets first get what we have had
		incService.findFiltered({active:"true"},function(err,baseline){
			_incidentsOLD = _.clone(baseline,true);
			logger.debug("---------------------- incService.findFiltered({active:true} baseline: "+baseline.length+" incidents")
			incService.findRevenueImpactMapping(function(err,impactMapping){
				var _diff;
				var _omitForDiff = ["_id","syncDate"];

			  var _incidentsNEWSysIds = _.pluck(data.records,'sys_id');
        var _incidentsOLDSysIds = _.pluck(_incidentsOLD,'sysId');
				var _incidentsDELTASysIds;
				_incidentsDELTASysIds = _.difference(_incidentsOLDSysIds,_incidentsNEWSysIds);

				if (_incidentsDELTASysIds.length>0){
					logger.debug("************************  THERE ARE INCIDENTS WHICH NEEDS TO BE C L O S E D   ***********************************");
	        logger.debug("OLD *************** "+_incidentsOLDSysIds.length);
	        logger.debug("NEW *************** "+_incidentsNEWSysIds.length);
	        logger.debug("DELTA *************** delta size: "+_incidentsDELTASysIds.length);
					_handleClosedIncidents(_incidentsDELTASysIds,_incidentsOLD,_incidentsNEW);
					// so now we have the to be closed again in the NEW list
					incidentsNEWSysIds = _.pluck(_incidentsNEW,'sysId');
					logger.debug("--------------------------------- AFTER CLOSE HANDLING: "+incidentsNEWSysIds.length+" incidents in incidentsNEWSysIds");
				}
				var _incidentsDELTA_CHANGED = [];

				for (var i in data.records){
					var _incident = incService.filterRelevantData(data.records[i]);
					//enrich/join with revenue impact
					var _impact = _.findWhere(impactMapping,{"incident":_incident.id});
					if (_impact){
						 _incident.revenueImpact = parseInt(_impact.impact);
					}
					_incidentsNEW.push(_incident);

					var _old = _.findWhere(_incidentsOLD,{"sysId":_incident.sysId});
					var _changed={};
          if (_old){
            //_diff=jsondiffpatch.diff(_filterRelevantDataForDiff(_old),_filterRelevantDataForDiff(_incidentsNEW[n]));
						//logger.debug(".... found _old to check diff "+_old.id);
						_diff=jsondiffpatch.diff(_.omit(_old,_omitForDiff),_.omit(_incident,_omitForDiff));
            if (_diff){
              var _change ={"id":_old.id,"sysId":_old.sysId,"diff":_diff}
              _incidentsDELTA_CHANGED.push(_change);
            }
          }
				}
				//redo
				_incidentsNEWSysIds = _.pluck(_incidentsNEW,'sysId');
				_incidentsDELTASysIds = _.difference(_incidentsNEWSysIds,_incidentsOLDSysIds);

				logger.debug("OLD *************** "+_incidentsOLDSysIds.length);
        logger.debug("NEW *************** "+_incidentsNEWSysIds.length);
        logger.debug("CHANGES *********** "+_incidentsDELTA_CHANGED.length);
				logger.debug("******************* DELTA:  "+_incidentsDELTASysIds.length);
				// do the NEW HANDLING
        var _incidentsDELTA_NEW =[];
        for (var d in _incidentsDELTASysIds){
          _incidentsDELTA_NEW.push(_.findWhere(_incidentsNEW,{"sysId":_incidentsDELTASysIds[d]}))
        }
        if (_incidentsDELTA_NEW.length>0 || _incidentsDELTA_CHANGED.length>0){
          var _incidentsDIFF={"createDate":new Date(),"NEW":_incidentsDELTA_NEW,"CHANGED":_incidentsDELTA_CHANGED}
          incService.saveDelta(_incidentsDIFF,function(err,result){
						if (err){
								logger.error("err: "+err.message);
						}
						else{
							logger.info("[SUCCESS]....saved incident DELTAS  NEW: "+_incidentsDELTA_NEW.length+ " - CHANGED: "+_incidentsDELTA_CHANGED.length);
							logger.debug("[going to sync incidents]....length: "+_incidentsNEW.length);
							// update the IncidentTracker
							//1) NEW: incident will increment the "incídenttracker_openedAt" daily value for the according priority
							if (_incidentsDIFF.NEW.length>0){
								_handleIncidentsNEW(_incidentsDIFF.NEW);
							}
							else {
								logger.debug("[NO NEW INCIDENT] _incidentsDIFF.NEW.length==0");
							}
							// we have to check whether the state has changed (and accordingly the either "resolvedAt" or "closedAt") collections
							if (_incidentsDIFF.CHANGED.length>0){
								_handleIncidentsCHANGED(_incidentsDIFF.CHANGED,baseline,_incidentsNEW);
							}
							//3) final stuff
							var _message=_incidentsNEW.length+" incidents (active==true) synced - NEW: "+_incidentsDIFF.NEW.length +" | CHANGED: "+_incidentsDIFF.NEW.length;
							app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:_message,type:type});
							_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);

							callback(null,"OK");
						}
					});
        }
				else{
					logger.debug("---------------------- IncidentSyncService says: no NEW or CHANGED incidents - NOTHING TO DO  ------------------------------------")
				}
			})
		})
	}).on('error',function(err){
      var _message=err.message;
			logger.error('[IncidentSyncSerice] says: something went wrong on the request', err.request.options);
			app.io.emit('syncUpdate', {status:"[ERROR]",from:"incident",timestamp:new Date(),info:err.message,type:type});
			_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusERROR,type);
			callback(err);
  });
}

/** in case that an incidnet is closed - we have to derive this from the inverse delta
* accessing incdeints by sysID = https://bwinparty.service-now.com/ess/incident_list.do?JSONv2&sysparm_action=getRecords&sysparm_sys_id=23cc7cb90f2bbd0052fb0eece1050e44
*/
function _handleClosedIncidents(deltaIds,incidentsBaseline,incidentsNew){
	if (deltaIds){
		logger.debug("++++++++++++++++++++++++++++ "+deltaIds.length+" CLOSED INCIDENTS ++++++++++++++++++++++++++++++++++++++++");
		for (var i in deltaIds){
			var _inc = _.findWhere(incidentsBaseline,{"sysId":deltaIds[i]});
			logger.debug("* "+_inc.id+" "+_inc.state);
			logger.debug("* lets CLOSE it...");
			_inc.state = "Closed";

			var _url =config.sync[_syncName].url+"&sysparm_sys_id="+_inc.sysId
			_getSnowData(_url,function(err,data){
				// or fetch it via API call
				incidentsNew.push(_inc);
			})
		}
	}
}

function _handleIncidentsNEW(incidents){
	// insert the NEW incidents !
	incService.insert(incidents,function(err,success){
		if (err){
			logger.error('incidents.insert failed: '+err.message);
		}
		else if(success){
			logger.info("[success] incService.insert : "+incidents.length +" NEW incidents inserted");
			incTrackerService.incrementTracker(incidents,["openedAt","resolvedAt","closedAt"],function(err,result){
				if (err) logger.error("[IncidentSyncService] NEW Incident - incTrackerService.incrementTracker FAILED: "+err.message);
				else {
					logger.info("[IncidentSyncService] NEW Incident - incTrackerService.incrementTracker SUCCESS: "+JSON.stringify(result));
					if (config.emit.snow_incidents_new =="on"){
						for (var i in incidents){
							_emitNEWIncidentMessage(incidents[i]);
						}
					}
				}
			});
		} //else if (success) end
	}) //incidents.insert()
}


/**
  + in CHANGED we have an array of incident pointers
 	+ so we need to first grab all changed incidents from the baseline and pack them into the CHANGED array for the update of incidents
		"CHANGED" : [{"id" : "INC123721","sysId" : "0080c2380f8c8a4052fb0eece1050e8e","diff" : {
*/
function _handleIncidentsCHANGED(changes,baseline,_incidentsNEW){
	logger.debug("[CHANGED INCIDENT] _incidentsDIFF.CHANGED.length = "+changes.length);
	var _updateIncidents = [];
	for (var i in changes){
		var _pointer = changes[i];
		var _inc = _.findWhere(_incidentsNEW,{"id":_pointer.id});
		var _diff = changes[i];
		var _oldinc = _.findWhere(baseline,{"id":_pointer.id});
		_inc._id = _oldinc._id;
		logger.debug("---------------------------------------------------------------------------------------------------------------------------------");
		logger.debug("---------------------------------------------------------------------------------------------------------------------------------");
		logger.debug("   ---  _pointer.id: "+_pointer.id);
		logger.debug("   ---  _inc from incidentsNEW: : "+_inc.id+" sysId: "+_inc.sysId);
		logger.debug("   ---  _oldinc from incidentsOLD: : "+_oldinc.id+" sysId: "+_oldinc.sysId+ " _id: "+_oldinc._id);
		logger.debug("   ---  _oldinc: "+JSON.stringify(_oldinc));
		logger.debug("   ---  enriched incident with _id: "+_inc._id);
		logger.debug("---------------------------------------------------------------------------------------------------------------------------------");
		logger.debug("---------------------------------------------------------------------------------------------------------------------------------");
		// we also need an mongo _id to to a proper update....
		_updateIncidents.push(_inc);

		if (config.emit.snow_incidents_changes =="on"){
			_emitCHANGEIncidentMessage(_diff,_inc);
		}
	}
	incService.update(_updateIncidents);
	// => with this list I can easily create the tracker ??
	// ===> looks like we double count stuff currently ... on CHANGES
	// ===> try to fix: only handle resolved and closed datefields => opened is only for new ones !
	incTrackerService.incrementTracker(_updateIncidents,["resolvedAt","closedAt"],function(err,result){
		if (err) logger.error("[IncidentSyncService] CHANGED Incident - incTrackerService.incrementTracker FAILED: "+err-message);
		else {
			logger.info("[IncidentSyncService] CHANGED Incident - incTrackerService.incrementTracker SUCCESS: "+JSON.stringify(result));
		}
	});
}


function _emitNEWIncidentMessage(incident){
	var _newincident = incident;
	var _message={};
	var _type;
	var _prio = _getPrio(incident);
	_message.title=_newincident.businessService;
	_message.body = "+ "+_newincident.label+"\n"+_newincident.shortDescription;
	//_message.type = _type;
	_message.desktop={desktop:true,icon:"/images/incidents/"+_prio+".png"};
	logger.debug("========================== message: "+JSON.stringify(_message));
	// filter out stuff
	var _exclude = config.emit.snow_incidents_new_exclude_businessservices;
	if (!_.startsWith(_newincident.businessService,_exclude)){
		logger.debug("========================== going to emit websocket message ===================================");
		app.io.emit('message', {msg:_message});
	}
}


function _emitCHANGEIncidentMessage(change,incident){
	var _message={};
	var _type;
	var _prio=_getPrio(incident);
	// only notify changes of those fields
	var _fields = ["state","assignmentGroup","priority"];
	_message.title=incident.businessService;
	var _body = "+ "+incident.id+"\n";
	var _send = false;
	for (var i in _.keys(change.diff)){
		var _key = _.keys(change.diff)[i];
		//console.log("_key: "+_key);
		if (_fields.indexOf(_key)>-1){
			_body+=_key+"\n+ "+change.diff[_key][0]+" -> "+change.diff[_key][1]+"\n";
			_send = true;
		}
	}
	_message.body = _body
	//_message.type = _type;
	_message.desktop={desktop:true,icon:"/images/incidents/"+_prio+"_changed.png"};
	logger.debug("========================== message: "+JSON.stringify(_message));
	// filter out stuff
	var _exclude = config.emit.snow_incidents_changes_exclude_businessservices;
	if (!_.startsWith(incident.businessService,_exclude) && _send == true){
		logger.debug("========================== going to emit websocket message ===================================");
		app.io.emit('message', {msg:_message});
	}
}

function _getPrio(incident){
	if (_.startsWith(incident.priority,"P01")){
		_prio = "P01";
	}
	else if(_.startsWith(incident.priority,"P08")){
		_prio = "P08";
	}
	else if(_.startsWith(incident.priority,"P16")){
		_prio = "P16";
	}
	else if(_.startsWith(incident.priority,"P40") || _.startsWith(incident.priority,"P120")){
		_prio = "P120";
	}
	return _prio;
}

function _getTimeStringForTimeRange(start,stop){
	var ms = moment(stop,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
	var d = moment.duration(ms);
	var _time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
	return _time;
}


function _getSnowData(url,callback){
	var client = require('node-rest-client').Client;
	client = new Client({user:_secret.snowUser,password:_secret.snowPassword});
	logger.debug("*** [_getSnowData] client.get data : url = "+url);
	client.get(url, function(data, response,done){
		callback(null,data);
	})
}
