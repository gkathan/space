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

var incService = require('../services/IncidentService');

router.get("/stats", function(req, res, next) {

	incService.calculateStats(function(err,stats){
			res.locals.stats = stats;
			res.render("incidents/stats");
	})


});


router.get("/detail/:incidentId", function(req, res, next) {
	logger.debug("--------------------- incidentId: "+_id);
	var _id = req.params.incidentId;

	incService = require('../services/IncidentService');
	var incident;
	incService.findById(_id,function(err,incident){
		incService.findProblem(incident,function(err,problem){
			logger.debug("============ incident: "+incident.id);
			incService.findChangeLog(_id,function(err,changelog){
					if (err){
							logger.error("[error] "+err.message);
					}
					else{

						if (incident.slaResolutionDate){
							var _opened = incident.openedAt;
							var _sla = incident.slaResolutionDate;
							var _now = new Date();
							if (_now > _sla && incident.active=="true") incident.overdue = true;
							else incident.overdue = false;
						}

						res.locals.changelog=changelog;
						res.locals.incident=incident;
						res.locals.problem=problem;
						res.locals.moment=moment;
						res.render("incidents/detail");
					}
			})
		})
	})
});


module.exports = router;
