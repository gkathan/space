var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var moment = require('moment');
var accounting = require('accounting');


var spaceServices=require('space.services');

var avService = spaceServices.AvailabilityService;
var avCalculatorService = require('../services/AvailabilityCalculatorService');

var targetService = spaceServices.TargetService;
var incService=spaceServices.IncidentService;

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


			}
			res.locals.moment = moment;
			logger.debug("------------------------ ");
			targetService.getL1(target_context,function(err,l1targets){
					res.locals.l1targets=l1targets;

					/*
					_targetAV = parseFloat(l1targets[0].directMetric);
					_currentAV = parseFloat(av.avReport.getYTDDatapoint.unplanned);
					logger.debug("XXXXXXXXXXXXXX av"+JSON.stringify(av));
					res.locals.leftdowntime =  moment.duration(avCalculatorService.getTimeForAVPercentage(_currentAV,{value:365-moment().dayOfYear(),type:"days"})).format('HH:mm.ss');
					res.locals.targetdowntime = moment.duration(avCalculatorService.getTimeForAVPercentage(_targetAV,{value:1,type:"year"})).format('HH:mm.ss');
					*/
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
		var inc = spaceServices.IncidentService;
		var prob = spaceServices.ProblemService;

		//default is in config
		var _from = moment().startOf('month').format("YYYY-MM-DD");

		var _to = moment().format("YYYY-MM-DD");
		if (req.query.to) _to = moment(req.query.to).add(1,"days").format("YYYY-MM-DD");//"2015-01-10";
		if (req.query.from)	 _from = req.query.from;//"2015-01-01";
		var _customer;
		var _filter;
		//"openedAt", "resolvedAt", "closedAt"
		var _dateField = req.query.dateField;
		res.locals.dateField = _dateField;


		if (req.query.customer){
			_customer = req.query.customer;//"bwin" or "pmu" or "danske spil",...;
			_filter = {customer:_customer};
		}
		else _filter = {customer:"* ALL *"};

		prob.find({},function(err,problems){
			avc.calculateOverall(_from,_to,_filter,function(avDataOverall){
				avc.calculateExternal(_from,_to,_filter,function(avDataExternal){
					var _prio = "P01 - Critical";
					// var _prio  = "P08 - High";
					// var _prio  = "P16 - Moderate";
					var _incfilter={openedAt:{$gte:new Date(_from),$lte:new Date(_to)},priority:_prio};

					inc.findFiltered(_incfilter,{openedAt:-1},function(err,snowIncidents){

						res.locals.slaMetrics=_enrichIncidents(snowIncidents,problems);

						res.locals.av = avDataOverall;
						res.locals.avExternal = avDataExternal;
						res.locals.snowIncidents = snowIncidents;
						res.locals.coreDef = config.availability.coreTime
						res.locals.moment = moment;
						res.locals.from = _from;
						res.locals.to = _to;
						res.locals.filter = _filter;
						res.locals.sla_incidents = config.customers.sla.incidents;
						res.locals.accounting=accounting;
						logger.debug("*****customer: "+_customer);
						logger.debug("*****incidents: "+snowIncidents.length);
						res.render('dashboard/itservicereport', { title: 's p a c e - IT service report prototype' });
					});
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
		var inc = spaceServices.IncidentService;
		var prob = spaceServices.ProblemService;

		//sess.AUTH = user.role;

		//default is in config
		var _from = moment().startOf('month').format("YYYY-MM-DD");
		var _to = moment().add(1,"days").format("YYYY-MM-DD");

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
		// add one day to include the last day
		if (req.query.to) _to = moment(req.query.to).add(1,"days").format("YYYY-MM-DD");//"2015-01-10";



		if (req.query.excludeNOLABEL) _excludeNOLABEL = req.query.excludeNOLABEL;

		var labelService = spaceServices.LabelService;

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
							res.locals.slaMetrics=_enrichIncidents(filteredIncidents,problems);
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

/**
* enriches and returns some metrics
*/
function _enrichIncidents(incidents,problems){
	var _sumBreach = 0;
	for (var i in incidents){
		// enrich with configured SLA times
		var _inc = incidents[i];
		var _prio = _inc.priority.split(" - ")[0];
		var _sla = config.customers.sla.incidents[_prio];
		_inc.slaConfig = _sla;

		if (_inc.resolvedAt){
			var _ttr = moment(_inc.resolvedAt).diff(moment(_inc.openedAt));
			_inc.ttr = _createTTR(_ttr,_sla);
			if (_inc.ttr.slaBreach) _sumBreach++;
		}

		if (_.findWhere(problems,{"id":_inc.problemId})){
			_inc.problemSysId=_.findWhere(problems,{"id":_inc.problemId}).sysId;
		}
	}
	var _slaPercentage = 100-((_sumBreach/incidents.length)*100);
	var _slaMetrics = {totalBreached:_sumBreach,totalAchieved:incidents.length-_sumBreach,percentage:parseFloat(_slaPercentage).toFixed(2)}
	return _slaMetrics;
}


function _createTTR(time,sla){
 	var d = moment.duration(time);
   var _ttrString =  d.format("h:mm:ss", { trim: false })
		if (d>=86400000) _ttrString = d.format("d[d] h:mm:ss", { trim: false });
		var _return ={ttrHours:d/60000/60,ttrString:_ttrString,slaBreach:false};
   if (_return.ttrHours>sla) _return.slaBreach=true;
 	return _return;
}

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
