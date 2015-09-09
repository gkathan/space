var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var moment = require('moment');
var accounting = require('accounting');

var avService = require('../services/AvailabilityService');
var targetService = require('../services/TargetService');
var incService=require('../services/IncidentService');

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

	var target_context;
	if (_context=="gvc.studios") target_context = "bpty.studios";
	else target_context = _context;


	  //if (!req.session.AUTH){
	if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			logger.debug("no req.session.AUTH found: ");
			res.redirect("/login");
	}
	else{
		avService.getLatest(function(av){

			if (av){
				res.locals.availability = av;
				res.locals.downtime = avService.getDowntimeYTD(av.unplannedYTD,av.week);
				res.locals.targetdowntime = avService.getDowntimeYTD(av,52);
				res.locals.leftdowntime = avService.getDowntimeYTD(av,52);
			}

			res.locals.moment = moment;

			targetService.getL1(target_context,function(err,l1targets){
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
		res.locals.moment = moment;
		res.render('dashboard/incidents', { title: 's p a c e - incidents dashboard' });
});

router.get('/incidents_line', function(req, res) {
		var _period = req.query.period;
		res.locals.period = _period;
		res.locals.moment = moment;
		res.render('dashboard/incidents_line', { title: 's p a c e - incidents linedashboard' });
});

router.get('/incidents_subdimension', function(req, res) {
		var _period = req.query.period;
		var _subdimension = req.query.subDimension;;
		res.locals.period = _period;
		res.locals.moment = moment;
		res.locals.subDimension=_subdimension;
		res.render('dashboard/incidents_subdimension', { title: 's p a c e - incidents by '+_subdimension });
});

router.get('/incidents_activeticker', function(req, res) {
		var _period = req.query.period;

		incService.getLatestTicker(function(err,ticker){
			res.locals.period = _period;
			res.locals.moment = moment;
			res.locals.ticker=ticker;

			res.render('dashboard/incidents_activeticker', { title: 's p a c e - incidents activeticker ' });

		})

});


router.get('/qos', function(req, res) {
		res.render('dashboard/qos', { title: 's p a c e - QoS dashboard' });
});

router.get('/itservicereport', function(req, res) {
		var avc = require ('../services/AvailabilityCalculatorService');
		var inc = require ('../services/IncidentService');

		//default is in config
		var _from = moment().startOf('year').format("YYYY-MM-DD");
		var _to = moment().format("YYYY-MM-DD");
		var _customer;
		var _filter;
		//"openedAt", "resolvedAt", "closedAt"
		var _dateField = req.query.dateField;
		res.locals.dateField = _dateField;

		if (req.query.from)	 _from = req.query.from;//"2015-01-01";
		if (req.query.to) _to = req.query.to;//"2015-01-10";
		if (req.query.customer){
			_customer = req.query.customer;//"bwin" or "pmu" or "danske spil",...;
			_filter = {customer:_customer};
		}
		else _filter = {customer:"* ALL *"};

		avc.calculateOverall(_from,_to,_filter,function(avDataOverall){
			avc.calculateExternal(_from,_to,_filter,function(avDataExternal){
				var _prio = "P01 - Critical";
				// var _prio  = "P08 - High";
				// var _prio  = "P16 - Moderate";
				var _incfilter={openedAt:{$gte:new Date(_from),$lte:new Date(_to)},priority:_prio};

				inc.findFiltered(_incfilter,{openedAt:-1},function(err,snowIncidents){


					res.locals.av = avDataOverall;
					res.locals.avExternal = avDataExternal;
					res.locals.snowIncidents = snowIncidents;
					res.locals.coreDef = config.availability.coreTime
					res.locals.moment = moment;
					res.locals.from = _from;
					res.locals.to = _to;
					res.locals.filter = _filter;
					res.locals.accounting=accounting;
					logger.debug("*****customer: "+_customer);

					res.render('dashboard/itservicereport', { title: 's p a c e - IT service report prototype' });
				});
			});
		});
});



/** cloned from firerport
* [TODO] harmoniaze the crap again after bwin report is downtime
*/
router.get('/opsreport', function(req, res) {
		var _customer = req.session.USER;
		ensureAuthenticated(req, res);

		var avc = require ('../services/AvailabilityCalculatorService');
		var inc = require ('../services/IncidentService');
		var prob = require ('../services/ProblemService');

		//sess.AUTH = user.role;

		//default is in config
		var _from = moment().startOf('year').format("YYYY-MM-DD");
		var _to = moment().format("YYYY-MM-DD");

		var _filter = {customer:_customer};;

		// 0 ... do NOT exclude "No Labels"
		// 1 ... do exclude "No Labels"
		// 2 ... just show "No Labels"
		var _excludeNOLABEL = 0;

		var _prio = "P01";



		if (req.query.prio && (req.query.prio=="P01"||req.query.prio=="P08"||req.query.prio=="P16"||req.query.prio=="P120")){
			_prio = req.query.prio;
		}

		if (req.query.from)	 _from = req.query.from;//"2015-01-01";
		if (req.query.to) _to = req.query.to;//"2015-01-10";
		if (req.query.excludeNOLABEL) _excludeNOLABEL = req.query.excludeNOLABEL;

		var labelService = require('../services/LabelService');

		prob.find({},function(err,problems){



			avc.calculateOverall(_from,_to,_filter,function(avDataOverall){
				avc.calculateExternal(_from,_to,_filter,function(avDataExternal){
					var _incfilter={
								P01:{openedAt:{$gte:new Date(_from),$lte:new Date(_to)},priority:"P01 - Critical",category:{$nin:config.incidents.customerImpact.categoryExclude}},
								P08:{openedAt:{$gte:new Date(_from),$lte:new Date(_to)},priority:"P08 - High",category:{$nin:config.incidents.customerImpact.categoryExclude}},
								P16:{openedAt:{$gte:new Date(_from),$lte:new Date(_to)},priority:"P16 - Moderate",category:{$nin:config.incidents.customerImpact.categoryExclude}}
					};

					inc.findFiltered(_incfilter[_prio],{openedAt:-1},function(err,snowIncidents){
						logger.debug("++++++++++++++++++++++++++ all snow incidents.length: "+snowIncidents.length);
						labelService.filterIncidents(snowIncidents,_customer,_excludeNOLABEL,function(err,filteredIncidents){
							logger.debug("++++++++++++++++++++++++++ filtered snow incidents.length: "+filteredIncidents.length);
							for (var i in snowIncidents){
								if (_.findWhere(problems,{"id":snowIncidents[i].problemId})){
									snowIncidents[i].problemSysId=_.findWhere(problems,{"id":snowIncidents[i].problemId}).sysId;
								}
							}
							res.locals.av = avDataOverall;
							res.locals.labelService = labelService;
							res.locals.customer = _customer;
							res.locals.prio = _prio;


							res.locals.avExternal = avDataExternal;
							res.locals.snowIncidents = filteredIncidents;
							res.locals.coreDef = config.availability.coreTime
							res.locals.moment = moment;
							res.locals.from = _from;
							res.locals.to = _to;

							res.locals.problems = problems;
							res.locals.sla_incidents = config.customers.sla.incidents;
							res.locals.excludeNOLABEL = _excludeNOLABEL;
							res.locals.filter = _filter;
							res.locals.accounting=accounting;
							logger.debug("*****customer: "+_customer);

							res.render('dashboard/opsreport', { title: 's p a c e - '+_customer+' opsreport' });
						})
					});
				});
			});
		});
	});




router.get('/corpIT', function(req, res) {
		var apps=[{name:"lync",rag:"green"},{name:"servicenow",rag:"amber"},{name:"email",rag:"green"},{name:"versionone",rag:"green"},{name:"Pi",rag:"green"},{name:"oracle financials",rag:"green"},{name:"moss",rag:"green"},{name:"confluence",rag:"green"},{name:"myrewards",rag:"green"}];
		var telephony=[{name:"polycom video conferencing",rag:"green"},{name:"telephony landlines",rag:"red"},{name:"blackberry",rag:"green"},{name:"other mobile",rag:"green"}];
		var network=[{name:"gibraltar",rag:"green"},{name:"vienna",rag:"green"},{name:"hyderabad",rag:"green"},{name:"london",rag:"green"},{name:"sofia"}];

		res.locals.apps=apps;
		res.locals.telephony=telephony;
		res.locals.network=network;
		res.render('dashboard/corpIT', { title: 's p a c e - corpIT dashboard' });
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
