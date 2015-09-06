var config = require('config');
var mongojs = require('mongojs');
var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.excludeIncidentForCustomer = _excludeIncidentForCustomer;
exports.findLabel2Customer = _findLabel2Customer;
exports.filterIncidents = _filterIncidents;

/**
* checks whether a given list of labels from an incdient is relevant for a filter list of labels
* param: labelsFilter = list of labels which belong to a customer e.g. for bwin this is ["bwin.com","bwin.it","bwin.es","bwin.fr"]
* param: labelsIncident = list of labels affected by an incident e.g. ["pmu.fr","bwin.com"]
* return: true if either labelsIncident is null or empty, or the intersection of the 2 lists includes a value
*/
function _excludeIncidentForCustomer(incident,customer,callback){

	var filter ={customer:"bwin"};
	_findLabel2Customer(filter,function(err,filterLabels){
		callback(null,_checkExclusion(incident,filterLabels));
	})
}

/**
* param incident: guess ;-)
* param filterLabels: the labels we filter against
* param excludeNoLabels: flag which indicates whether "No Labels" value in incident.label field shall be excluded or not
// 0 ... do NOT exclude "No Labels"
// 1 ... do exclude "No Labels"
// 2 ... just show "No Labels"
**/
function _checkExclusion(incident,filterLabels,excludeNOLABELS){
		var _labels = incident.label.split(", ");

		if (excludeNOLABELS==0){
			if (incident.label==="No Label") return false;
			else if (!_labels || _labels.length==0 || filterLabels.length==0) return false;
			else if (_.intersection(filterLabels,_labels).length>0) return false;
			return true;
		}
		else if (excludeNOLABELS==1){
			if (!_labels || _labels.length==0 || filterLabels.length==0) return false;
			else if (_.intersection(filterLabels,_labels).length>0) return false;
			return true;
		}
		else{
			if (incident.label.indexOf("No Label")>=0) return false;

			return true;
	}
}

/**
*/
function _findLabel2Customer(filter,callback) {
	var _label2customer =  db.collection('label2customer');
  _label2customer.find(filter,function(err,result){
    if (err){
      logger.error("LabelService.label2customer says: "+err.message);
      callback(err);
    }
    else{
      callback(null,_.pluck(result,"label"));
    }
  });
}


function _filterIncidents(incidents,customer,excludeNOLABELS,callback){
	var async = require('async');
	var filteredIncidents =[];


	_findLabel2Customer({customer:customer},function(err,filterLabels){
			for (var i in incidents){
				var _inc = incidents[i];
				//logger.debug("++ checking incident: "+_inc.id+" filterlabels: "+filterLabels);
				if (!_checkExclusion(_inc,filterLabels,excludeNOLABELS)) filteredIncidents.push(_inc);
			}
			logger.debug("------------------------ number of incidents: "+incidents.length);
			callback(null,filteredIncidents);
	})


}
