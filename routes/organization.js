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
	if (ensureAuthenticated(req,res)){
		console.log("------------- :date = "+req.params.date);
		res.locals.orgdate=req.params.date;
		res.render("organization/org_tree", { title: 's p a c e - organizationchart - history: '+req.params.date });
	}
});

router.get("/tree", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		var _employee=req.query.employee;
		if (_employee){
			var _split = _employee.split(" ");
			var _first = _split[0];
			var _last = _split[1];
			orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){
				res.locals.root=employee["Employee Number"];
				logger.debug("YYYYYYYYYYYYYYYYYYYY"+employee["Employee Number"]);
				res.render("organization/org_tree", { title: 's p a c e - organizationchart - current' });
			})
		}
		else {
			res.render("organization/org_tree", { title: 's p a c e - organizationchart - current' });
		}

	}
});


router.get("/history/circlecontain/:date", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		console.log("------------- :date = "+req.params.date);
		res.locals.orgdate=req.params.date;
		res.locals.collection="organization";
		res.render("organization/circlecontain", { title: 's p a c e - organizationchart - history: '+req.params.date });
	}
});


router.get("/circlecontain", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.locals.collection="organization";
		res.render("organization/circlecontain", { title: 's p a c e - circlecontain chart - current' });
	}
});

router.get("/partition", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.locals.collection="organization";
		res.render("organization/partition", { title: 's p a c e - partition chart - current' });
	}
});

router.get("/tree_vertical", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		var _employee=req.query.employee;
		if (_employee){
			var _split = _employee.split(" ");
			var _first = _split[0];
			var _last = _split[1];
			orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){
				res.locals.collection="organization";
				if (employee){

					res.locals.baseRoot=employee;
					employee.employee=employee["First Name"]+" "+employee["Last Name"];
					logger.debug("------------- "+employee);
					res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });
				}
				else{
					logger.debug("..sorry no employee found for "+_employee);
					res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });
				}
			})
		}else {
				res.locals.collection="organization";
				res.render("organization/tree_vertical", { title: 's p a c e - vertical tree orgchart - current' });

		}

	}
});


// for the other circlecontains....
router.get("/circlecontain/:collection", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.locals.collection=req.params.collection;
		res.render("organization/circlecontain",{ title: "s p a c e - "+req.params.collection });
	}
});

// for the other partitions....
router.get("/partition/:collection", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.locals.collection=req.params.collection;
		res.render("organization/partition",{ title: "s p a c e - partition -"+req.params.collection });
	}
});


router.get("/radial", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.render("organization/org_radial", { title: 's p a c e - organizationchart - current' });
	}
});

router.get("/force", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.render("organization/force");
	}
});

router.get("/simple", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.render("organization/simple");
	}
	//res.sendfile("org.html");
});

router.get("/trend", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		orgService.getOrganizationTrend({},function(err,trend){
			res.locals.trend = trend;
				res.render("organization/trend");
		})

	}
});




router.get("/experiement", function(req, res, next) {
	res.send("experiment");
});

router.get("/experiement2", function(req, res, next) {
	res.send("experiement2");
});

module.exports = router;



function ensureAuthenticated(req, res) {
	logger.debug("[CHECK AUTHENTICATED]");
  if (!req.session.AUTH){
		  logger.debug("[*** NOT AUTHENTICATED **]");
      req.session.ORIGINAL_URL = req.originalUrl;
		  res.redirect("/login");
      return false
	}
  return true;
}
