/**
 * user service
 */


var config = require('config');

var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);




var users = [
    { id: 1, username: 'admin', password: '4dm1n', role: 'admin' },
    { id: 2, username: 'exec', password: '3x3c', role: 'exec' },
     { id: 2, username: 'bpty', password: 'bPt7', role: 'bpty' }
];




/**
 * 
 */
exports.findById = function (id, fn) {

 var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }

}

exports.findByUsername = function (username,fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}








