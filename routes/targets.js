var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongojs = require("mongojs");

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');

var avService = require('../services/AvailabilityService');
var targetService = require('../services/TargetService');

var _targets;

//https://github.com/iros/underscore.nest/issues/2
_ = require('underscore');
_.nst = require('underscore.nest');

/* GET targets . */
router.get('/overview', function(req, res, next) {
	_handleTargetOverview(req,res,next,"./targets/overview");
});

/* GET targets . */
router.get('/rollup', function(req, res, next) {
	_handleTargetRollup(req,res,next,"./targets/rollup","bpty");
});

/* GET targets . */
router.get('/sunburst', function(req, res, next) {
	res.render('targets/sunburst')
});

/* GET targets by targetID . */
router.get('/employee2target', function(req, res, next) {
	var pickL2 = req.query.pickL2;
	var showTargetTree = req.query.showTargetTree;
	var showEmployeeTree = req.query.showEmployeeTree;

	var targetService = require('../services/TargetService');
	var orgService = require('../services/OrganizationService');

	targetService.getL2ById(config.context,pickL2,function(err,L2Target){
		var _first = L2Target.sponsor.split(" ")[0];
		var _last = _.rest(L2Target.sponsor.split(" ")).join(" ");
		logger.debug("L2Target.sponsor: "+L2Target.sponsor);
		logger.debug("first: "+_first+ "last: "+_last);
		orgService.findEmployeeByFirstLastName(_first, _last,function(err,sponsor){
			logger.debug("--------- showEmployeeTree: "+showEmployeeTree);
			logger.debug("--------- showTargetTree: "+showTargetTree);
			res.locals.sponsor = sponsor;
			res.locals.pickL2=pickL2;
			res.locals.target = L2Target;
			res.locals.showTargetTree=showTargetTree;
			res.locals.showEmployeeTree=showEmployeeTree;
			res.render('targets/employee2target')
		});
	});
});

/* GET ALL full broccoli targets by targetID . */
router.get('/employee2targetall', function(req, res, next) {
	var pickL2 = req.query.pickL2;
	var showTargetTree = req.query.showTargetTree;
	var showEmployeeTree = req.query.showEmployeeTree;
	logger.debug("--------- showEmployeeTree: "+showEmployeeTree);
	logger.debug("--------- showTargetTree: "+showTargetTree);
	res.locals.pickL2=pickL2;
	res.locals.showTargetTree=showTargetTree;
	res.locals.showEmployeeTree=showEmployeeTree;
	res.render('targets/employee2targetall')
});


router.get('/target2outcomes/:L2TargetId', function(req, res, next) {
	var L2TargetId = req.params.L2TargetId;
	var orgService = require('../services/OrganizationService');

	logger.debug("--------- L2TargetId: "+L2TargetId);
	var targetService = require('../services/TargetService');
	targetService.getL2ById(config.context,L2TargetId,function(err,L2Target){

		if (L2Target){
			var _first = L2Target.sponsor.split(" ")[0];
			var _last = _.rest(L2Target.sponsor.split(" ")).join(" ");
			logger.debug("L2Target.sponsor: "+L2Target.sponsor);
			logger.debug("first: "+_first+ "last: "+_last);

			orgService.findEmployeeByFirstLastName(_first, _last,function(err,sponsor){
				logger.debug("***** sponsor: "+sponsor);
				res.locals.target = L2Target;
				orgService.getTarget2EmployeeMappingByL2Target(L2TargetId,function(err,employees){
					// some statistics
					var _empCount=0;
					var _outCount=0;
					var _e = [];
					for (var e in employees){
						if (employees[e].outcomes.length>0){
							_empCount++;
							_outCount+=employees[e].outcomes.length;
							_e.push(employees[e]);
						}
					}
					//default
					res.locals.showEmployeeTree="costCenter";

					res.locals.statistics = {"numberOfEmployees":_e.length,"numberOfOutcomes":_outCount,"numberOfLocations":_.uniq(_.pluck(_e,"unit")).length};
					res.locals.sponsor = sponsor;
					res.locals.employees = employees;
					res.render('targets/target2outcomes');
				})
			})
		}
		else{
			res.locals.message="sorry ....  => "+ L2TargetId+ " is not a supported L2Target ID ";
			res.render('error');
			//res.send("[s p a c e] says: sorry .... but something is fishy => "+ L2TargetId+ " is not a supported L2Target ID ");
		}
	})
});

router.get('/employeeoutcomes/:employeeId', function(req, res, next) {
	var employeeId = req.params.employeeId;
	var _employee;
	var orgService = require('../services/OrganizationService');
	orgService.findEmployeeById(employeeId,function(err,employee){
		_employee= employee;
		logger.debug("--------------------------------------------------");

		orgService.findOutcomesForEmployee(employeeId,function(err,outcomes){
			if (outcomes){
				// UKR employees currently not in PI ;-)
				if (!_employee){
					_employee = {"Employee Number":employeeId,"Full Name":employeeId+" - "+outcomes[0].employeeName};
				}
				res.locals.outcomes=outcomes;

				// and extract the additional team / area infos for the employee - just take the first ...
				_employee.unit = outcomes[0].unit;
				_employee.area = outcomes[0].area;
				_employee.team = outcomes[0].team;
				_employee.role = outcomes[0].role;

				res.locals.employee=_employee;

				res.render('targets/employeeoutcomes');
			}
			else{
				logger.debug("--------------- NOPE NO OUTCOMES found !!!!!!!!!!!!!!!!!!");
				res.locals.outcomes=[];
				res.locals.employee=_employee;
				res.render('targets/employeeoutcomes');
			}
		})
	})
});



router.get('/overview/old', function(req, res, next) {
	_handleTargetOverview(req,res,next,"targets/overview_old");
});


function _handleTargetOverview(req,res,next,view){
	res.locals._=require('lodash');
	var _context;
	if (req.session.CONTEXT){
		_context = req.session.CONTEXT;
	}
	else
	{
		_context = config.context;
	}
	logger.debug("-------------------------: "+_context);
	var viewContext = req.query.context;
	if (viewContext) _context = viewContext;
	logger.debug("-------------------------: "+_context);

	var target_context;
	if (_context=="gvc.studios") target_context = "bpty.studios";
	else target_context = _context;

	targetService.getAll(target_context,function(err,data){
		var _L2targets = [];
		var _L1targets = [];

		if (data.length>0){
			for (var i in data){
				if (data[i].type=="L2") _L2targets.push(data[i]);
				if (data[i].type=="L1") _L1targets.push(data[i]);
			}
			var L2targetsClustered = _.nst.nest(_L2targets,["theme","cluster","group"]);
			//logger.debug("****L2targetsClustered: "+JSON.stringify(L2targetsClustered));

			// the lanes like RUN GROW TRANSFORM
			//["RUN","GROW","TRANSFORM"]
			var _sortOrder= config.targets.laneSorting;

			res.locals.targets=_.sortBy(L2targetsClustered.children,function(lane){
					return _sortOrder.indexOf(lane.name);
			});
			res.locals.L1targets=_.sortBy(_L1targets,"id");
			logger.debug("L1targets: "+_L1targets.length);
			logger.debug("L2targets: "+L2targetsClustered.children.length);
			// take the first for the globals...
			var _target;
			if (L2targetsClustered.children.length>0){
				 _target= L2targetsClustered.children[0].children[0].children[0].children[0];
				res.locals.vision=_target.vision;
				res.locals.start=moment(_target.start).format();
				res.locals.end=moment(_target.end).format();
				res.locals.period = new moment(_target.end).format('YYYY').toLowerCase();
				res.locals.lastUpdate = moment(_target.lastUpdate).format('MMMM Do YYYY');
			}
			var _colors = _.findWhere(config.entities,{'name':_context}).skin.colors;
			logger.debug("colors: "+_colors.secondary);
			res.locals.colors= _colors;

			//;-) hardcoded for now....
			res.locals.color_PARENT = "#174D75";
			res.locals.color_PL = _colors.primary;
			res.locals.color_RUN = _colors.secondary;
			res.locals.color_GROW= _colors.secondary2;
			res.locals.color_TRANSFORM = _colors.secondary3;
			res.locals.context=_context;

			avService.getLatest(function(av){
				res.locals.availability = av;
				res.render(view, { title: 's p a c e - targets overview' });
			});
		}
		else{
			res.locals.targets=[];
			res.locals.L1targets=[];
			res.locals.L2targets=[];
			res.locals.vision="undefined";
			res.locals.start="undefined";
			res.locals.end="undefined";
			res.locals.period = "undefined";
			res.locals.availability = {};
			res.render(view, { title: 's p a c e - targets overview' });
		}
	});
}


function _handleTargetRollup(req,res,next,view,context){
	res.locals._=require('lodash');
	var _context;
	if (req.session.CONTEXT){
		_context = req.session.CONTEXT;
	}
	else
	{
		_context = config.context;
	}
	// if we get one explicitely - we override
	// eg for the corporate rollup
	if (context) _context=context;
	logger.debug("-------------------------");
	targetService.getAll(_context,function(err,data){
		var _L2targets = [];
		var _L1targets = [];
		if (data.length>0){
			for (var i in data){
				if (data[i].type=="L2") _L2targets.push(data[i]);
				if (data[i].type=="L1") _L1targets.push(data[i]);
			}
			var _targetsClustered = _.nst.nest(data,["profit","context","theme","group","target"]);
			var _targetsClusteredTheme= _.nst.nest(data,["profit","theme","context","target"]);
			res.locals.targetsClustered = _targetsClustered.children[1];
			res.locals.targetsClusteredTheme = _targetsClusteredTheme;
			res.locals.L1targets=_L1targets;
			logger.debug("L1targets: "+_L1targets.length);
			// take the first for the globals...
			//	var _target = L2targetsClustered.children[0].children[0].children[0].children[0];
			//res.locals.vision=_target.vision;
			var _colors = _.findWhere(config.entities,{'name':_context}).skin.colors;
			logger.debug("colors: "+_colors.secondary);
			res.locals.colors= _colors;
			res.locals.color_PL = _colors.primary;
			res.locals.color_RUN = _colors.secondary;
			res.locals.color_GROW= _colors.secondary2;
			res.locals.color_TRANSFORM = _colors.secondary3;
			res.locals.context=_context;
			res.render(view, { title: 's p a c e - targets overview' });

		}
		else{
			res.locals.targets=[];
			res.locals.L1targets=[];
			res.locals.L2targets=[];
			res.locals.vision="undefined";
			res.locals.start="undefined";
			res.locals.end="undefined";
			res.locals.period = "undefined";
			res.locals.availability = {};
			res.render(view, { title: 's p a c e - targets overview' });
		}
	});
}

module.exports = router;
