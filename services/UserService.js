/**
 * user service
 */


var config = require('config');

var crypto = require('crypto');

var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);
// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');



exports.findByUsername = _findByUsername;
exports.authenticate = _authenticate;


function _findByUsername(username,callback) {
	var users =  db.collection('users');
	users.findOne({username:username},function (err, user){
		callback(err,user);
		return;
	});
}

function _authenticate(username,password,callback){
  var _hashedpw = crypto.createHash("sha256").update(password).digest("hex");
  _findByUsername(username,function(err,user){
		if (!user){
			callback(null,null);
		}
		else if (user && _hashedpw === user.password){
      callback(null,user)
			return;
    }
    else {
      callback(null,null);
    }
  })
}
