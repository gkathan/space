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




exports.findEmployeeByFirstLastName = _findEmployeeByFirstLastName;
exports.findEmployeeById = _findEmployeeById;
exports.findEmployeesByFilter = _findEmployeesByFilter;
exports.findEmployeesByFunction = _findEmployeesByFunction;
exports.findEmployees = _findEmployees;
exports.getEmployeesByTargets = _getEmployeesByTargets;
exports.syncEmployeeImages = _syncEmployeeImages;
exports.getOrganizationHistoryDates = _getOrganizationHistoryDates;
exports.findTarget2EmployeeMapping = _findTarget2EmployeeMapping;


/**
 *
 */
function _findEmployeeByFirstLastName(firstname,lastname, callback) {
	logger.debug("findEmployeeByFirstLastName first: "+firstname+", last: "+lastname);
	var organization =  db.collection('organization');
		organization.find({'First Name':firstname,'Last Name':lastname}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+JSON.stringify(docs));
			callback(err,docs[0]);
			return;
	});
}

function _findEmployeeById(employeeId, callback) {
	logger.debug("findEmployeeById ID: "+employeeId);
	var organization =  db.collection('organization');
		organization.findOne({'Employee Number':employeeId}, function (err, result){
			if (result) logger.debug("[ok] found some shit ... : "+JSON.stringify(result));
			callback(err,result);
			return;
	});
}



function _findEmployeesByFilter(filter, callback) {
	logger.debug("findEmployeesByFilter filter: "+filter);
	var organization =  db.collection('organization');
		organization.find(filter).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(err,docs);
			return;
	});
}


function _findEmployeesByFunction(_function, callback) {
	logger.debug("findEmployeesByFunction _function: "+_function);

	var organization =  db.collection('organization');
		organization.find({'Function':_function}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(err,docs);
			return;
	});
}

function _findEmployees(callback) {
	logger.debug("findEmployees: all");
	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(docs);
			return;
	});
}


function _findTarget2EmployeeMapping(callback) {
	logger.debug("findTarget2EmployeeMapping");
	var mapping =  db.collection('target2employee');
		mapping.find({}).sort({$natural:1}, function (err, docs){
			//if (docs) logger.debug("[ok] found some shit ... : "+docs);
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
function _getEmployeesByTargets(target2employeeMapping,callback) {
	logger.debug("getEmployeesByTargets for mapping");

	var targetService = require('./TargetService');

	var _context="bpty.studios";
	_findEmployees(function(employees){
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

			//logger.debug("[1st round:] targets collected:"+_targets)

			// add "Cost Center" attribute from orgshit


			var _data=[];

			for (var t in _targets){
				for (var m in target2employeeMapping){
					var _map = target2employeeMapping[m];
					if (_map.targets.indexOf(_targets[t])>-1){

						if (!_.findWhere(_data,{"name":_targets[t]})){
							// this has to be done for a new target
							//logger.debug("-------- new target added: "+_targets[t]);
							var _item ={name:_targets[t],type:"L2target",children:[]};
							_data.push(_item);
						}
						var _target = _.findWhere(_data,{"name":_targets[t]});

						// do some enriching from org collection
						var _employee = _.findWhere(employees,{"Employee Number":_map.employeeId});
						var _costCenter;
						if (_employee){
							_costcenter = _employee["Cost Centre"];
						}

						// check whether this employee is already in
						if (!_.findWhere(_target.children,{"id":_map.employeeId})){
							_target.children.push({id:_map.employeeId,name:_map.employeeName,costCenter:_costcenter});
						}

					}
				}
			}

			//logger.debug("[2nd round:] result:"+JSON.stringify(_results));



			// adding the root node
			var _results = [];
			var _context = "bpty.studios";
			// tha root
			_results.push({name:_context,children:_data})


			callback(err,_results);
				})
	})
}




/**
 * http://my.bwinparty.com/api/people/images/e1000
 */
function _syncEmployeeImages(req,res,callback) {


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
function _getOrganizationHistoryDates(callback){
   db.collection("organizationhistory").find({},{oDate:1}).sort({oDate:-1},function(err,data){
			logger.debug("OrganizationService.getOrganizationHistoryDates(): ");
			if (err) {
				logger.warn("error: "+err);
				callback(err);
			}

			else callback(data);
	});
}
