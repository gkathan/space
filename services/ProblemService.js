/**
 * incident service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
require('moment-duration-format');
_ = require('lodash');
_.nst=require('underscore.nest');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var _problemsCollection="problems";


exports.find = _find;

/**
 *
 */
function _find(filter,callback) {
	var items =  db.collection(_problemsCollection);
	items.find(filter).sort({openedAt:-1}, function (err, docs){
			callback(err,docs);
			return;
	});
}
