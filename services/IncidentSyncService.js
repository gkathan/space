/**
* service which syncs on a scheduled basis with the configured prioity  incidents from snow API
**/
var config = require('config');
var schedule = require('node-schedule');
var _ = require('lodash');
var moment = require('moment');

var app=require('../app');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

var jsondiffpatch=require('jsondiffpatch');
// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var _syncName = "incidents";

var app=require('../app');

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

exports.sync = _sync;

function _sync(url,type,callback){
	var _syncStatus = require('./SyncService');
	var _timestamp = new Date();
	var _statusERROR = "[ERROR]";
	var _statusSUCCESS = "[SUCCESS]";

	var _secret = require("../config/secret.json");
	var options_auth={user:_secret.snowUser,password:_secret.snowPassword};
	logger.debug("snowUser: "+_secret.snowUser);
	var Client = require('node-rest-client').Client;
	client = new Client(options_auth);
		/*
			Priority:
			Display Value	Actual Value
			P01 – Critical	1
			P08 – High	2
			P16 - Moderate	3
			P40/120 – Low	4
		*/
	// only get ACTIVE incidents => the others do not change anymore ;-)
	url+="priority<="+config.sync[_syncName].includePriority+"^active=true";

	client.get(url, function(data, response,done){
		// parsed response body as js object
		logger.debug("...data:"+data);
		logger.debug("...response:"+response.records);
		logger.debug("arguments.callee.name: "+arguments.callee.name);
		logger.debug("[_syncIncident]...client.get data..: _url:"+url);

		var incService = require('./IncidentService');
		var incTrackerService = require('./IncidentTrackerService');

    var _incidentsNEW=[];
    var _incidentsOLD;

		// lets first get what we have had
		incService.findFiltered({active:"true"},function(err,baseline){
			_incidentsOLD = _.clone(baseline,true);
			logger.debug("---------------------- incService.findFiltered({active:true} baseline: "+baseline.length+" incidents")

			incService.findRevenueImpactMapping(function(err,impactMapping){
				var _compareIncidents=[];
				var _compareIncidentsBaseline=[];

				//walks over the newly fetched snow raw data and filters (maps) the relevant space format
				for (var i in data.records){
					var _incident = incService.filterRelevantData(data.records[i]);
					_incidentsNEW.push(_incident);
					_compareIncidents.push(_filterRelevantDataForDiff(_incident));
				}

        var _diff;

				for (var o in _incidentsOLD){
					_compareIncidentsBaseline.push(_filterRelevantDataForDiff(_incidentsOLD[o]));
				}

        var _incidentsDELTA_CHANGED =[];
        // enrich with data from other sources
				for (var n in _incidentsNEW){
          var _sysId = _incidentsNEW[n].sysId;
          var _old = _.findWhere(_incidentsOLD,{"sysId":_sysId});
					//enrich/join with revenue impact
					var _impact = _.findWhere(impactMapping,{"incident":_incidentsNEW[n].id});
					if (_impact){
						 _incidentsNEW[n].revenueImpact = parseInt(_impact.impact);
					}
          var _changed={};
          if (_old){
            _diff=jsondiffpatch.diff(_filterRelevantDataForDiff(_old),_filterRelevantDataForDiff(_incidentsNEW[n]));
            if (_diff){
              var _change ={"id":_old.id,"sysId":_old.sysId,"diff":_diff}
              _incidentsDELTA_CHANGED.push(_change);
            }
          }
        }
        var _incidentsNEWSysIds = _.pluck(_incidentsNEW,'sysId');
        var _incidentsOLDSysIds = _.pluck(_incidentsOLD,'sysId');
        var _incidentsDELTASysIds = _.difference(_incidentsNEWSysIds,_incidentsOLDSysIds);

        logger.debug("OLD *************** "+_incidentsOLDSysIds.length);
        logger.debug("NEW *************** "+_incidentsNEWSysIds.length);
        logger.debug("DELTA *************** delta size: "+_incidentsDELTASysIds.length);

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

							if (_incidentsDIFF.CHANGED.length>0){
								_handleIncidentsCHANGED(_incidentsDIFF.CHANGED,baseline,_incidentsNEW);
							}

							/*
							2) CHANGED: we have to check whether the state has changed (and accordingly the either "resolvedAt" or "closedAt") collections
							  + in CHANGED we have an array of incident pointers
							 + so we need to first grab all changed incidents from the baseline and pack them into the CHANGED array for the update of incidents

								"CHANGED" : [
					        		{
					            "id" : "INC123721",
					            "sysId" : "0080c2380f8c8a4052fb0eece1050e8e",
					            "diff" : {
							*/
							//3) final stuff
							var _message=_incidentsNEW.length+" incidents (active==true) synced - NEW: "+_incidentsDIFF.NEW.length +" | CHANGED: "+_incidentsDIFF.NEW.length;
							app.io.emit('syncUpdate', {status:"[SUCCESS]",from:_syncName,timestamp:_timestamp,info:_message,type:type});
							_syncStatus.saveLastSync(_syncName,_timestamp,_message,_statusSUCCESS,type);

							callback(null,"OK");

						}
					});
        }
				else{
					logger.debug("---------------------- IncidentSyncService says: <no change - nothing to do>")
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


function _handleIncidentsNEW(incidents){
	// insert the NEW incidents !
	incService.insert(incidents,function(err,success){
		if (err){
			logger.error('incidents.insert failed: '+err.message);
		}
		else if(success){
			logger.info("[success] incService.insert : "+incidents.length +" NEW incidents inserted");
			incTrackerService.incrementTracker(incidents,function(err,result){
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

function _handleIncidentsCHANGED(changes,baseline,_incidentsNEW){
	logger.debug("[CHANGED INCIDENT] _incidentsDIFF.CHANGED.length = "+changes.length);
	var _updateIncidents = [];
	for (var i in changes){
		var _pointer = changes[i];
		var _inc = _.findWhere(_incidentsNEW,{"id":_pointer.id});
		var _diff = changes[i];

		// TODO: add the reverese delta handling to identify CLOSED items !

		var _oldinc = _.findWhere(baseline,{"id":_pointer.id});
		_inc._id = _oldinc._id;

		//_inc._id =
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
	incTrackerService.incrementTracker(_updateIncidents,function(err,result){
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
	_message.desktop={
		desktop:true,
		icon:"/images/incidents/"+_prio+".png"
	};
	logger.debug("========================== message: "+JSON.stringify(_message));
	// filter out stuff
	var _exclude = config.emit.snow_incidents_new_exclude_businessservices;
	if (!_.startsWith(_newincident.businessService,_exclude)){
		logger.debug("========================== going to emit websocket message ===================================");
		app.io.emit('message', {msg:_message});
	}
}


/**
						{
						"id" : "INC125959",
            "sysId" : "c96321ab0fdc4a403e89fe6362050e13",
            "diff" : {
                "slaResolutionDate" : [
                    ISODate("2015-06-04T06:59:44.000Z"),
                    ISODate("2015-06-04T07:30:35.000Z")
                ],
                "state" : [
                    "Resolved",
                    "In progress"
                ],
                "slaBreach" : [
                    false,
                    ""
                ],
*/
function _emitCHANGEIncidentMessage(change,incident){

	var _message={};
	var _type;
	var _prio=_getPrio(incident);
	// only notify changes of those fields
	var _fields = ["state","assignmentGroup","priority"];

	//_message.title="-- "+change.id+" CHANGED --";
	_message.title=incident.businessService;

	var _body = "+ "+incident.label+"\n"+incident.shortDescription+"\n";
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
	_message.desktop={
		desktop:true,
		icon:"/images/incidents/"+_prio+"_changed.png"
	};
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

/**
* filters out the relevant attributes of the 87 fields from snow ;-)
*/
function _filterRelevantDataForDiff(incident){
	//_id, _syncDate
	delete incident._id;
	delete incident.syncDate;
	return incident;
}




function _getTimeStringForTimeRange(start,stop){
	var ms = moment(stop,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
	var d = moment.duration(ms);
	var _time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
	return _time;
}


function _getData(url,priority,date,callback){
		var Client = require('node-rest-client').Client;
		client = new Client();
		// direct way

		url+="priority<="+priority+"^opened_at>"+date;

		logger.debug("*** client.get data : url = "+url);


		client.get(url, function(data, response,callback){
			// parsed response body as js object
			logger.debug("...data:"+data);
			logger.debug("...response:"+response.records);

			logger.debug("...get data..: _url:"+url);
			callback(data);
		})
}
