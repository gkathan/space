/**
 * organization service
 */


var config = require('config');

var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);



var winston=require('winston');
var logger = winston.loggers.get('space_log');



/**
 *
 */
exports.findEmployeeByFirstLastName = function (firstname,lastname, callback) {
	logger.debug("findEmployeeByFirstLastName first: "+firstname+", last: "+lastname);
	var organization =  db.collection('organization');
		organization.find({'First Name':firstname,'Last Name':lastname}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+JSON.stringify(docs));
			callback(err,docs[0]);
			return;
	});
}

exports.findEmployeeById = function (employeeId, callback) {
	logger.debug("findEmployeeById ID: "+employeeId);
	var organization =  db.collection('organization');
		organization.findOne({'Employee Number':employeeId}, function (err, result){
			if (result) logger.debug("[ok] found some shit ... : "+JSON.stringify(result));
			callback(err,result);
			return;
	});
}



exports.findEmployeesByFunction = function (_function, callback) {
	logger.debug("findEmployeesByFunction _function: "+_function);
	var organization =  db.collection('organization');
		organization.find({'Function':_function}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(err,docs);
			return;
	});
}

exports.findEmployees = function (callback) {
	logger.debug("findEmployees: all");
	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(docs);
			return;
	});
}


exports.findTarget2EmployeeMapping = function (callback) {
	logger.debug("findTarget2EmployeeMapping");
	var mapping =  db.collection('target2employee');
		mapping.find({}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(err,docs);
			return;
	});
}

/**
* returns target arrays and per target mapped the employees
* param target2employeeMApping (input from HR)
	[
		{employeeID:"E2988",targets:["R1.1","G1.2"]},
		{employeeID:"E2987",targets:["R1.2","G1.2"]}
	]

* return
		[
			{"R1.1":["E2988"]},
			{"R1.2":["E2987"]},
			{"G1.2":["E2988","E2987"]}
		]
*/
exports.getEmployeesByTargets = function (target2employeeMapping,callback) {
	logger.debug("getEmployeesByTargets for mapping");

	var targetService = require('./TargetService');
	var _context="bpty.studios";
	targetService.getL2(_context,function(err,targets){

		var _targets=[];

		for (var i in target2employeeMapping){
			var _map = target2employeeMapping[i];
			for (var t in _map.targets){
				if (_targets.indexOf(_map.targets[t])<0){
					_targets.push(_map.targets[t]);
				}
			}
		}

		logger.debug("[1st round:] targets collected:"+_targets)

		var _results = [];

		for (var t in _targets){
			for (var m in target2employeeMapping){
				var _map = target2employeeMapping[m];
				if (_map.targets.indexOf(_targets[t])>-1){

					if (!_.findWhere(_results,{"target":_targets[t]})){
						// this has to be done for a new target
						logger.debug("-------- new target added: "+_targets[t]);
						var _item ={context:"bpty.studios",target:_targets[t],employees:[]};
						_results.push(_item);
					}

					_.findWhere(_results,{"target":_targets[t]}).employees.push(_map.employeeID);

					logger.debug("!!!!! target match");// this employee (_map.employeeID) is mapped to this target _targets[t]
				}
			}
		}

		logger.debug("[2nd round:] result:"+JSON.stringify(_results));

		callback(err,_results);

	})
}




/**
 * http://my.bwinparty.com/api/people/images/e1000
 */
exports.syncEmployeeImages = function (req,res,callback) {


	var fs = require('fs');
    var request = require('request');

	var download = function(uri, filename, callback){
		request.head(uri, function(err, res, body){
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);

			//request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};

	logger.debug("***** sync....");

	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){

			if (docs){


				for (var employee in docs){
					logger.debug("* e: "+docs[employee]["First Name"]);
					var _id = docs[employee]["Employee Number"];
					var _imageURL = "http://my.bwinparty.com/api/people/images/";


					download(_imageURL, _id+'.png', function(){
					  console.log('done: '+_id);
					});
				}
			}

		});

	}









/**
 * organization snapsho dates
 * => should be moved in a service class ;-)
 */
exports.getOrganizationHistoryDates = function(callback){
   db.collection("organizationhistory").find({},{oDate:1}).sort({oDate:-1},function(err,data){
			logger.debug("OrganizationService.getOrganizationHistoryDates(): ");
			if (err) {
				logger.warn("error: "+err);
				callback(err);
			}

			else callback(data);
	});
}
