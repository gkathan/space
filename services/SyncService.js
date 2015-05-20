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
