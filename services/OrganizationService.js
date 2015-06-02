/**
 * organization service
 */


var config = require('config');

var mongojs = require('mongojs');

_ = require('lodash');
	_.nst = require('underscore.nest');

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
exports.findTarget2EmployeeMappingClustered = _findTarget2EmployeeMappingClustered;
exports.getTarget2EmployeeMappingByL2Target = _getTarget2EmployeeMappingByL2Target;
exports.findOutcomesForEmployee = _findOutcomesForEmployee;


/**
 *
 */
function _findEmployeeByFirstLastName(firstname,lastname, callback) {
	logger.debug("findEmployeeByFirstLastName first: "+firstname+", last: "+lastname);
	var organization =  db.collection('organization');
		organization.find({'First Name':firstname,'Last Name':lastname}).sort({$natural:1}, function (err, docs){
			if (err) logger.error("[ERROR] something went wrong..."+err.message);
			if (docs) logger.debug("[ok] found some stuff ... : "+JSON.stringify(docs));
			callback(err,docs[0]);
			return;
	});
}

function _findEmployeeById(employeeId, callback) {
	logger.debug("findEmployeeById ID: "+employeeId);
	var organization =  db.collection('organization');
		organization.findOne({'Employee Number':employeeId}, function (err, result){
			if (result) logger.debug("[ok] found some stuff ... : "+JSON.stringify(result));
			callback(err,result);
			return;
	});
}



function _findEmployeesByFilter(filter, callback) {
	logger.debug("findEmployeesByFilter filter: "+filter);
	var organization =  db.collection('organization');
		organization.find(filter).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some stuff ... : "+docs.length+" employees");
			callback(err,docs);
			return;
	});
}


function _findEmployeesByFunction(_function, callback) {
	logger.debug("findEmployeesByFunction _function: "+_function);

	var organization =  db.collection('organization');
		organization.find({'Function':_function}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some stuff ... : "+docs.length+ " employees");
			callback(err,docs);
			return;
	});
}

function _findEmployees(callback) {
	logger.debug("findEmployees: all");
	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some stuff ... : "+docs.length+" employees");
			callback(err, docs);
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
gets the targets per clustered employee
*/
function _findTarget2EmployeeMappingClustered(callback) {
	logger.debug("findTarget2EmployeeMappingClustered");

	_findTarget2EmployeeMapping(function(err,docs){
			//if (docs) logger.debug("[ok] found some shit ... : "+docs);
			docs = _.nst.nest(docs,["employeeId"])
			callback(err,docs);
			return;
	});
}


/**
gets the targets per clustered employee
*/
function _getTarget2EmployeeMappingByL2Target(L2TargetId,callback) {
	logger.debug("_getTarget2EmployeeMappingByL2Target for L2TargetId: "+L2TargetId);

	_findTarget2EmployeeMappingClustered(function(err,docs){
		_findEmployees(function(err,allEmployees){
				logger.debug("allEmployees.length: "+allEmployees.length);
				var _employees=[];
				logger.debug("docs.children length: "+docs.children.length);

				for (var i in docs.children){
					var _employee = docs.children[i];
					//logger.debug("*** _employee: "+JSON.stringify(_employee));

					var _emp = _.findWhere(allEmployees,{"Employee Number":_employee.name});
					if (!_emp) _emp = _employee;

					var _e ={employee:_emp,outcomes:[]};
					// targets - outcomes
					for (var o in _employee.children){
						var _target = _employee.children[o];

						if (_target.targets.indexOf(L2TargetId)>-1) {
							//logger.debug("*** _target: MATCH !!!!"+_target.targets);
							_e.outcomes.push({id:_target.id,title:_target.outcomeTitle,description:_target.outcomeDescription,successCriteria:_target.successCriteria,unit:_target.unit,area:_target.area,team:_target.team,role:_target.role});
						}
					}
					_employees.push(_e);
				}
				callback(err,_employees);
				return;
		});
	})
}


function _findOutcomesForEmployee(employeeId,callback) {
	logger.debug("_findOutcomesForEmployee: "+employeeId);

	var _outcomes =[];
	_findTarget2EmployeeMappingClustered(function(err,employees){
			var _targets=_.findWhere(employees.children,{name:employeeId});
			if (_targets && _targets.children){
				logger.debug("_targets.children: "+_targets.children.length);
				for (var t in _targets.children){
					var _target = _targets.children[t];
					_outcomes.push({L2Targets:_target.targets,title:_target.outcomeTitle,description:_target.outcomeDescription,successCriteria:_target.successCriteria,unit:_target.unit,area:_target.area,team:_target.team,role:_target.role,employeeName:_target.employeeName});
				}
				callback(err,_outcomes);
				return;
			}
			else{
				callback(err,null);
			}
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

param showEmployeeTree supported values are "costcenter,location,function,organization,vertical"
param showZTargetTree supported values are "theme,group,cluster"
*/
function _getEmployeesByTargets(target2employeeMapping,pickL2,showTargetTree,showEmployeeTree,callback) {
	logger.debug("getEmployeesByTargets for mapping");
	var _showTargetTree;
	var _showEmployeeTree;
	if (showTargetTree) _showTargetTree=showTargetTree.split(",");
	if (showEmployeeTree) _showEmployeeTree=showEmployeeTree.split(",");

	var targetService = require('./TargetService');

	var _context="bpty.studios";
	_findEmployees(function(err,employees){
		targetService.getL2(_context,function(err,targets){
			logger.debug("************ L2Targets: "+targets.length);
			var _targets=[];
			for (var i in target2employeeMapping){
				var _map = target2employeeMapping[i];
				for (var t in _map.targets){
					if (_targets.indexOf(_map.targets[t])<0){
					//if (!_.findWhere(_targets,{"id":_map.targets[t]})){
						var _targetId = _map.targets[t];
						logger.debug("_targetId: "+_targetId);
						//var _t = _.findWhere(targets,{"id":_targetId});
						_targets.push(_targetId);
					}
				}
			}
			logger.debug("************ mapped targets: "+_targets.length);

			var _data=[];

			for (var t in _targets){
				var _target = _.findWhere(targets,{"id":_targets[t]});
				logger.debug("--- find target: "+_targets[t]);
				if (_target){
					var _targetId = _target.id;
					for (var m in target2employeeMapping){
						var _map = target2employeeMapping[m];
						if (_map.targets.indexOf(_targetId)>-1){

							if (!_.findWhere(_data,{"name":_targetId})){
								// this has to be done for a new target
								_data.push({name:_targetId,theme:_target.theme,cluster:_target.cluster,group:_target.group,target:_target.target,type:"L2target",children:[]});
							}
							var _targetBucket = _.findWhere(_data,{"name":_targetId});
							// do some enriching from org collection
							var _employee = _.findWhere(employees,{"Employee Number":_map.employeeId});
							var _costCenter;
							var _location;
							var _function;

							if (_employee){
								_costcenter = _employee["Cost Centre"];
								_location = _employee["Location"];
								_function = _employee["Function"];
								_organization = _employee["Organization"];
								_vertical = _employee["Vertical"];
							}

							// check whether this employee is already in
							if (!_.findWhere(_target.children,{"id":_map.employeeId})){
								_targetBucket.children.push({id:_map.employeeId,name:_map.employeeName,location:_location,function:_function,costCenter:_costcenter,vertical:_vertical,organization:_organization});
							}
						}
					} // end if (_target)
				}
			}

			//var _showTargetTree=["theme"];
			//var _showEmployeeTree=["costCenter"];
			//var pickL2 = "G1.1";

			logger.debug("+++++++++++++++ showEmployeeTree: "+showEmployeeTree);
			logger.debug("+++++++++++++++ showTargetTree: "+showTargetTree);

			if (pickL2){
				_data = _.where(_data,{"name":pickL2});
			}

			_.nst = require('underscore.nest');

			if (_showEmployeeTree){
				//for every target
				for (var t in _data){
					// we go over every employee per target
					_data[t].children = _.nst.nest(_data[t].children,_showEmployeeTree).children;
				}
			}
			if (_showTargetTree){
					var _data = _.nst.nest(_data,_showTargetTree).children;
			}
			var _results = [];
			// adding the root node
			if (!pickL2){
				var _context = "bpty.studios";
				// tha root
				_results.push({name:_context,children:_data})
			}
			else{
				logger.debug("***************** _data: "+JSON.stringify(_data));
				var _pickedTarget = _.findWhere(targets,{"id":pickL2});
				if (_pickedTarget){
					var _context = _pickedTarget.theme;
					_results.push({name:_context,children:_data})
				}
			}
			callback(err,_results);
		})
	})
}




/**
 * http://my.bwinparty.com/api/people/images/e1000
 */
function _syncEmployeeImages(filter,callback) {
	var fs = require('fs');
  var request = require('request');

	logger.debug("***** sync....");

	var organization =  db.collection('organization');
		organization.find(filter).sort({$natural:1}, function (err, docs){
			if (docs){
				for (var employee in docs){
					logger.debug(employee+" :  E: "+docs[employee]["First Name"]+" "+docs[employee]["Last Name"]);
					var _id = docs[employee]["Employee Number"];
					var _imageURL = "http://my.bwinparty.com/api/people/images/";


					// [TODO]
					// 1) detect type (PngService.detectType)
					// 2) convert everything to png which is not png
					// 3) squarifyandcirclecrop

					//Lets define a write stream for our destination file
					var destination = fs.createWriteStream('./temp/'+_id);


					//Lets save the modulus logo now
					request(_imageURL+_id)
					.pipe(destination)
					.on('error', function(error){
					    console.log(error);
					});

					/*
					download(_imageURL, _id+'.png', function(){
					  console.log('done: '+_id);
					});
					*/
				}
				callback(null,"done");
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
