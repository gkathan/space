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
		var _period = req.query.period;
		res.locals.period = _period;
		res.render('dashboard/incidents', { title: 's p a c e - incidents dashboard' });
});

router.get('/qos', function(req, res) {
		res.render('dashboard/qos', { title: 's p a c e - QoS dashboard' });
});

router.get('/corpIT', function(req, res) {
		var apps=[{name:"email",rag:"green"},{name:"lync",rag:"green"},{name:"servicenow",rag:"amber"},{name:"email",rag:"green"},{name:"versionone",rag:"green"},{name:"Pi",rag:"green"},{name:"oracle financials",rag:"green"},{name:"moss",rag:"green"},{name:"confluence",rag:"green"},{name:"myrewards",rag:"green"}];
		var telephony=[{name:"polycom video conferencing",rag:"green"},{name:"telephony landlines",rag:"red"},{name:"blackberry",rag:"green"},{name:"other mobile",rag:"green"}];
		var network=[{name:"gibraltar",rag:"green"},{name:"vienna",rag:"green"},{name:"hyderabad",rag:"green"},{name:"london",rag:"green"},{name:"sofia",rag:"green"}];

		res.locals.apps=apps;
		res.locals.telephony=telephony;
		res.locals.network=network;

		res.render('dashboard/corpIT', { title: 's p a c e - corpIT dashboard' });
});




module.exports = router;
