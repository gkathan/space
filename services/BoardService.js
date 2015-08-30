/**
 * BoardService encapsulated fucntionality
 */
var config = require('config');
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var _ = require('lodash');

var DB="space";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);

exports.find=_find;
exports.findById=_findById;
exports.save=_save;
/**
 * find all Epics
 */
function _find(filter,callback) {
	var boards =  db.collection('boards');
		boards.find(filter).sort({createDate:-1}, function (err, boards){
			callback(err,boards);
			return;
	});
}

function _findById(id,callback){
	var boards =  db.collection('boards');
		boards.findOne({_id:ObjectId(id)}, function (err, board){
			callback(err,board);
			return;
	});
}

function _save(board,callback){
	var boards =  db.collection('boards');
	boards.save(board,function(err,success){
		callback(err,success);
	})
}
