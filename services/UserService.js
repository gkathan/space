/**
 * user service
 */


var config = require('config');
var secret = require('../config/secret');

var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);




var users = [
    { id: 1, username: secret.space_admin_user, password: secret.space_admin_pass, role: 'admin', context:'bpty.studios' },
    { id: 2, username: secret.space_exec_user, password: secret.space_exec_pass, role: 'exec', context:'bpty.studios' },
    { id: 3, username: secret.space_bpty_user, password: secret.space_bpty_pass, role: 'bpty', context:'bpty.studios' },
    { id: 4, username: secret.space_bwin_user, password: secret.space_bwin_pass, role: 'customer', context:'bpty.customer.bwin'},
    { id: 5, username: secret.space_studios_user, password: secret.space_studios_pass, role: 'studios', context:'bpty.studios'},
    { id: 6, username: secret.space_premium_user, password: secret.space_premium_pass, role: 'customer', context:'bpty.customer.premium'}
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
