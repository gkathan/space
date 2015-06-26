/**
  /incidents routes
*/
var mongojs = require("mongojs");
var nodeExcel = require('excel-export');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var moment = require('moment');

var winston = require('winston');
var logger = winston.loggers.get('space_log');

router.get("/", function(req, res, next) {
	res.render("incidents/incidents");
});


router.get("/changelog/:incidentId", function(req, res, next) {
	logger.debug("--------------------- incidentId: "+_id);
	var _id = req.params.incidentId;

	var incService = require('../services/IncidentService');
	var incident;
	incService.findById(_id,function(err,incident){
			logger.debug("============ incident: "+incident.id);
			incService.findChangeLog(_id,function(err,changelog){
					if (err){
							logger.error("[error] "+err.message);
					}
					else{
						res.locals.changelog=changelog;
						res.locals.incident=incident[0];
						res.locals.moment=moment;
						res.render("incidents/changelog");
					}
			})

	})



});


module.exports = router;
