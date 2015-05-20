/**
 * SOC  services
 */
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
/**
 *
 */
exports.findLabel2Customer = _findLabel2Customer;
exports.findOutages = _findOutages;
exports.findServices = _findServices;
exports.findServicesMain = _findServicesMain;
exports.findServicesExternal = _findServicesExternal;



/**
*/
function _findOutages(filter,callback) {
  	var _outages =  db.collection('soc_outages');

    _outages.find(filter,function(err,result){
      if (err){
        logger.error("SOCService.findOutages says: "+err.message);
        callback(err);
      }
      else{
        logger.debug("SOCService.findOutages says: OK");
        callback(null,result);
      }
    });
}


/**
*/
function _findLabel2Customer(filter,callback) {
  	var _label2customer =  db.collection('soclabel2customer');

    _label2customer.find(filter,function(err,result){
      if (err){
        logger.error("SOCService.label2customer says: "+err.message);
        callback(err);
      }
      else{
        logger.debug("SOCService.label2customer says: OK");
        callback(null,result);
      }
    });
}

function _findServices(filter,callback) {
  	var _services =  db.collection('soc_services');

    _services.find(filter,function(err,result){
      if (err){
        logger.error("SOCService.findServices says: "+err.message);
        callback(err);
      }
      else{
        logger.debug("SOCService.findServices says: OK");
        callback(null,result);
      }
    });
}


function _findServicesMain(callback){
	var _filter ={ServiceGroupID:1,Report:true,ext_service:false};
	_findServices(_filter,callback);
}

function _findServicesExternal(callback){
	var _filter ={ServiceGroupID:1,Report:true,ext_service:true};
	_findServices(_filter,callback);
}
