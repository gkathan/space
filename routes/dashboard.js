var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var moment = require('moment');


var avService = require('../services/AvailabilityService');
var targetService = require('../services/TargetService');

var winston=require('winston');
var logger = winston.loggers.get('space_log');

//
router.get('/', function(req, res) {

	var _context;
	if (req.session.CONTEXT){
		_context = req.session.CONTEXT;
	}
	else
	{
		_context = config.context;
	}


	  //if (!req.session.AUTH){
	if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			logger.debug("no req.session.AUTH found: ");
			res.redirect("/login");
		}
	else{


		avService.getLatest(function(av){

			res.locals.availability = av;

			res.locals.downtime = avService.getDowntimeYTD(av.unplannedYTD,av.week);
			res.locals.targetDowntime = avService.getDowntimeYTD(av,52);
			res.locals.leftDowntime = avService.getDowntimeYTD(av,52);
			res.locals.moment = moment;

			targetService.getL1(_context,function(l1targets){
					res.locals.l1targets=l1targets;

					logger.debug("l1 targets: "+ l1targets);

					res.render('dashboard', { title: 's p a c e - dashboards' });
			})

		});
	}
});

router.get('/availability', function(req, res) {
		res.render('dashboard/availability', { title: 's p a c e - availability dashboard' });
});

router.get('/incidents', function(req, res) {
		res.render('dashboard/incidents', { title: 's p a c e - incidents dashboard' });
});

router.get('/qos', function(req, res) {
		res.render('dashboard/qos', { title: 's p a c e - QoS dashboard' });
});





module.exports = router;
