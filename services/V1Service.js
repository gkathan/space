exports = module.exports = findEpicByRef;

var config = require('config');

var mongojs = require("mongojs");

var _ = require('lodash');


var DB="kanbanv2";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);


/**
 * find all Epics
 */
function findEpics () {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			//sort
			var _e =_.sortBy(docs[0].epics, "Number")
			return docs;
	});
}


/**
 * @param epicRef E-08383 format
 */
function findEpicByRef (epicRef) {
	var epics =  db.collection('v1epics');
		epics.find({}, function (err, docs){
			for (var i in _e){
				if (_e[i].Number==epicRef) return _e[i];
			}
	});
}


