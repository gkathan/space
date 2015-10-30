/**
  /org routes
*/
var mongojs = require("mongojs");
var nodeExcel = require('excel-export');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var spaceServices=require('space.services');
var orgService = spaceServices.OrganizationService;
var authService = require('../services/AuthService');

var winston=require('winston');
var logger = winston.loggers.get('space_log');

router.get("/", function(req, res, next) {
	res.send("org base page");
});



router.get("/facebook", function(req, res, next) {
	var _filter = req.query.filter;
	var _value = req.query.value;


	orgService.findStudiosEmployees(function(err,employees){
		logger.debug("-------------------/facebook: employees: "+employees.length);
		if (_filter && _value){
			logger.debug("filter: "+_filter+" - value: "+_value);
			var _f = {};
			_f[_filter]=_value;
			employees=_.where(employees,_f);
		}
		res.locals.employees = employees;
		res.render("organization/facebook");
	});
});

router.get("/facebook/:costcenter", function(req, res, next) {
	var costcenter=req.params.costcenter;

	orgService.findStudiosEmployees(function(err,employees){
		logger.debug("-------------------/facebook: employees: "+employees.length);
		res.locals.employees = _.where(employees,{"Cost Centre":costcenter});
		res.locals.costcenter = costcenter;
		res.render("organization/facebook");
	});
});



router.get("/history/tree/:date", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		console.log("------------- :date = "+req.params.date);
		res.locals.orgdate=req.params.date;
		res.render("organization/org_tree", { title: 's p a c e - organizationchart - history: '+req.params.date });
	}
	else res.redirect("/login");
});

router.get("/tree", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		var _employee=req.query.employee;
		var _hierarchy=req.query.hierarchy;
		if (!_hierarchy) _hierarchy = "bp";

		res.locals.hierarchy=_hierarchy;

		if (_employee){
			var _split = _employee.split(" ");
			var _first = _split[0];
			var _last = _.last(_split);
			orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){

				if (employee){
					res.locals.employeeId=employee["Employee Number"];
					res.locals.employee=employee["First Name"]+" "+employee["Last Name"];

				}
				res.render("organization/org_tree", { title: 's p a c e - organizationchart - current' });
			})
		}
		else {
			res.render("organization/org_tree", { title: 's p a c e - organizationchart - current' });
		}
	}
	else res.redirect("/login");
});


router.get("/history/circlecontain/:date", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		console.log("------------- :date = "+req.params.date);
		res.locals.orgdate=req.params.date;
		res.locals.collection="organization";
		res.render("organization/circlecontain", { title: 's p a c e - organizationchart - history: '+req.params.date });
	}
	else res.redirect("/login");

});


router.get("/circlecontain", function(req, res, next) {
	var _period = req.query.period;
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.locals.collection="organization";
		res.render("organization/circlecontain", { title: 's p a c e - circlecontain chart - current' });
	}
	else res.redirect("/login");
});

router.get("/partition", function(req, res, next) {
	var _period = req.query.period;
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.locals.collection="organization";
		res.render("organization/partition", { title: 's p a c e - partition chart - current' });
	}
	else res.redirect("/login");
});

router.get("/tree_vertical", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios","bpty"])){
		var _employee=req.query.employee;
		var _employeeId=req.query.employeeId;

		if (_employee){
			var _split = _employee.split(" ");
			var _first = _split[0];
			var _last = _split[1];
			orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){
				_render(employee,res,res);
			});
		}
		else if (_employeeId){
			orgService.findEmployeeById(_employeeId,function(err,employee){
				_render(employee,res,res);
			});
		}
		else {
			res.locals.collection="organization";
			res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });
		}
	}
	else res.redirect("/login");
});

function _render(employee,req,res){
			res.locals.collection="organization";
			if (employee){
				res.locals.baseRoot=employee;
				employee.employee=employee["First Name"]+" "+employee["Last Name"];
				logger.debug("------------- "+employee);
				res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });
			}
			else{
				logger.debug("..sorry no employee found for "+employee);
				res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });
			}
}



// for the other circlecontains....
router.get("/circlecontain/:collection", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.locals.collection=req.params.collection;
		res.render("organization/circlecontain",{ title: "s p a c e - "+req.params.collection });
	}
	else res.redirect("/login");
});

// for the other partitions....
router.get("/partition/:collection", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res["admin","exec","studios"])){
		res.locals.collection=req.params.collection;
		res.render("organization/partition",{ title: "s p a c e - partition -"+req.params.collection });
	}
	else res.redirect("/login");
});


router.get("/radial", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.render("organization/org_radial", { title: 's p a c e - organizationchart - current' });
	}
	else res.redirect("/login");
});

router.get("/force", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.render("organization/force");
	}
	else res.redirect("/login");
});

router.get("/simple", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		res.render("organization/simple");
	}
	else res.redirect("/login");
});

router.get("/trend", function(req, res, next) {
	if (authService.ensureAuthenticated(req,res,["admin","exec","studios"])){
		orgService.getOrganizationTrend({},function(err,trend){
			res.locals.trend = trend;
				res.render("organization/trend");
		})
	}
	else res.redirect("/login");
});




router.get("/experiement", function(req, res, next) {
	res.send("experiment");
});

router.get("/experiement2", function(req, res, next) {
	res.send("experiement2");
});

module.exports = router;
