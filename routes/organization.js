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







router.get("/", function(req, res, next) {
	res.send("org base page");
});

router.get("/facebook", function(req, res, next) {
	var orgService = require('../services/OrganizationService');
	orgService.findEmployeesByFunction("Studios",function(employees){

		res.locals.employees = employees;
		res.render("organization/facebook");
	});
});


router.get("/history/tree/:date", function(req, res, next) {
	console.log("------------- :date = "+req.params.date);
	res.locals.orgdate=req.params.date;
	res.render("organization/org_tree", { title: 's p a c e - organizationchart' });

});

router.get("/history/radial", function(req, res, next) {

	res.send("org radial");

});

router.get("/force", function(req, res, next) {
	res.render("organization/force");
});

router.get("/simple", function(req, res, next) {
	res.render("organization/simple");
	//res.sendfile("org.html");
});



router.get("/circlecontain/:collection", function(req, res, next) {

	res.locals.collection=req.params.collection;
	res.render("organization/circlecontain",{ title: "s p a c e - "+req.params.collection });

});

router.get("/experiement", function(req, res, next) {

	res.send("experiment");

});

router.get("/experiement2", function(req, res, next) {

	res.send("experiement2");

});

module.exports = router;
