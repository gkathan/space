/**
 * sync service
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
exports.saveLastSync = _saveLastSync;
exports.getLastSync = _getLastSync;
exports.getLastSyncs = _getLastSyncs;




/**
* param syncName: source syncer
* param timestamp: snapshot time
* param message: info text
* param status: error, success
* param type: API manual or scheduled auto
*/
function _saveLastSync(syncName,timestamp,message,status,type) {
	var syncstatus =  db.collection('syncstatus');
  var _item ={name:syncName,lastSync:timestamp,status:status,message:message,type:type};
  syncstatus.insert(_item,function(err,data){
    if (err){
      logger.error("_saveLastSync failed: "+err.message);
    }
    else{
      logger.info("_saveLast sync [OK] "+JSON.stringify(data));
    }
  });
}


function _getLastSync(syncName,callback){
	var syncstatus =  db.collection('syncstatus');
  logger.debug("getLastSync...");

  syncstatus.find({name:syncName}).sort({$natural:-1}).limit(1,function(err,result){
    if (err){
      callback(err);
    }
    else{
      callback(null,result[0]);
    }
  })
}

/**
* get snyc infos for an array of syncers
*/
function _getLastSyncs(syncers,callback){
	var syncstatus =  db.collection('syncstatus');
  logger.debug("getLastSync...");

  var async = require('async');
  var _result = [];
  async.eachSeries(syncers,function(_syncer,done){
    logger.debug("****async.each: "+_syncer.name);

    _getLastSync(_syncer.name,function(err,_lastSync){
      _result.push(_lastSync);
      done();
    })

  },function(err){
    logger.debug("*********all done");
    callback(err,_result);
  })




}
