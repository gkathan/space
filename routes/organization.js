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

var winston=require('winston');
var logger = winston.loggers.get('space_log');

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
	if (ensureAuthenticated(req,res)){
		console.log("------------- :date = "+req.params.date);
		res.locals.orgdate=req.params.date;
		res.render("organization/org_tree", { title: 's p a c e - organizationchart - history: '+req.params.date });
	}
});

router.get("/tree", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.render("organization/org_tree", { title: 's p a c e - organizationchart - current' });
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



// for the other circlecontains....
router.get("/circlecontain/:collection", function(req, res, next) {
	if (ensureAuthenticated(req,res)){
		res.locals.collection=req.params.collection;
		res.render("organization/circlecontain",{ title: "s p a c e - "+req.params.collection });
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
