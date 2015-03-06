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


router.get("/tree/:date", function(req, res, next) {
	console.log("------------- :date = "+req.params.date);
	res.locals.orgdate=req.params.date;
	res.render("organization/org_tree");
	
});

router.get("/radial", function(req, res, next) {

	res.send("org radial");
	
});

router.get("/force", function(req, res, next) {

	res.render("organization/force");
	
});


router.get("/circlecontain/:collection", function(req, res, next) {
	
	
	
	res.locals.collection=req.params.collection;
	res.render("organization/circlecontain",{ title: req.params.collection });
	
});

router.get("/experiement", function(req, res, next) {

	res.send("experiment");
	
});

router.get("/experiement2", function(req, res, next) {

	res.send("experiement2");
	
});

module.exports = router;




