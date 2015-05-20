/**
 * availability service
 */
var config = require('config');
var mongojs = require('mongojs');
var moment = require('moment');
require('moment-duration-format');

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
exports.getLatest = function (callback) {
	var items =  db.collection('availability');
	items.findOne({}, {sort:{$natural:-1}}, function (err, docs){
			callback(docs);
			return;
	});
}

/**
 * calculates the minutes of downtime based on the availability percentae given the period of time in weeks
 * formula used:
 * 99,99 % ≡ 4:23 minutes/month or 52:36 minutes / year or 1:05 minutes / week
 * meaning for every 0,01% per week we can roughly calculate 1 minute of downtim,e / week
 */
exports.getDowntimeYTD = function (avpercentageYTD,weeks){
	var av = (100-parseFloat(avpercentageYTD))*100;
	console.log("av: "+av);
	var minutes = av*weeks;
	return moment.duration(minutes,'minutes').format("hh:mm.ss");;
}
