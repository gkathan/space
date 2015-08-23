/**
 * BoardService encapsulated fucntionality
 */
var config = require('config');
var mongojs = require("mongojs");
var _ = require('lodash');

var DB="space";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

exports.find=_find;
exports.save=_save;
/**
 * find all Epics
 */
function _find(filter,callback) {
	var boards =  db.collection('boards');
		boards.find(filter, function (err, boards){
			//sort

			callback(err,boards);
			return;
	});
}

function _save(board,callback){
	var boards =  db.collection('boards');
	boards.save(board,function(err,success){
		callback(err,success);
	})
}
