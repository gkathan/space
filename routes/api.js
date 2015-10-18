/**
  /api routes
*/
var mongojs = require("mongojs");

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');


var winston=require('winston');
var logger = winston.loggers.get('space_log');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var spaceServices=require('space.services');
var incidentService = spaceServices.IncidentService;
var incidentTrackerService = spaceServices.IncidentTrackerService;
var organizationService = spaceServices.OrganizationService;


var exporter = require('../services/ExcelExportService');

var BASE = "";

/* GET api listing. */
var PATH_ROOT ="/";
var PATH = {
						ROOT : PATH_ROOT,
						REST_INITIATIVES : BASE+'/space/rest/initiatives',

						REST_ITEMSBACKLOGPLANNINGEPICS : BASE+'/space/rest/itemsbacklogplanningepics',
						REST_ITEMSBACKLOGINITIATIVES : BASE+'/space/rest/itemsbackloginitiatives',
						REST_ITEMSROADMAPINITIATIVES : BASE+'/space/rest/itemsroadmapinitiatives',
						REST_ITEMSEMPTY : BASE+'/space/rest/itemsempty',


						REST_METRICS : BASE+'/space/rest/metrics',
						REST_TARGETS : BASE+'/space/rest/targets/:period',
						REST_TARGETS_L1 : BASE+'/space/rest/targets/L1/:period',
						REST_TARGETSTREE : BASE+'/space/rest/targetstree',

						REST_TARGETSTRACKER : BASE+'/space/rest/targetstracker/:period',


						REST_TARGET2EMPLOYEE : BASE+'/space/rest/target2employee/:period',
						REST_TARGET2EMPLOYEECLUSTERED : BASE+'/space/rest/target2employeeclustered/:period',
						REST_EMPLOYEEBYTARGETS : BASE+'/space/rest/employeebytargets/:period',
						REST_OUTCOMESFOREMPLOYEE : BASE+'/space/rest/outcomesforemployee/:period/:employeeId',

						REST_BOARDS : BASE+'/space/rest/boards',
						REST_CREATEBOARD : BASE+'/space/rest/board',

						REST_RELEASES : BASE+'/space/rest/releases',
						REST_LANETEXT : BASE+'/space/rest/lanetext',
						REST_POSTITS : BASE+'/space/rest/postits',
						REST_LANES : BASE+'/space/rest/lanes',
						REST_SCRUMTEAMS : BASE+'/space/rest/scrumteams',
						REST_V1TEAMS : BASE+'/space/rest/v1teams',
						REST_PRODUCTPORTFOLIO : BASE+'/space/rest/productportfolio',
						REST_PRODUCTCATALOG : BASE+'/space/rest/productcatalog',

						REST_INCIDENTS : BASE+'/space/rest/incidents',
						REST_INCIDENTSACTIVETICKER : BASE+'/space/rest/incidentsactiveticker',
						REST_INCIDENTSKPIS : BASE+'/space/rest/incidentskpis',
						REST_INCIDENTSOLDSNOW : BASE+'/space/rest/incidentsoldsnow',
						REST_INCIDENTCOMMUNICATIONTRAIL : BASE+'/space/rest/incidents/commtrail/:sysid',
						REST_INCIDENTCHANGELOG : BASE+'/space/rest/incidents/changelog/:id',
						REST_INCIDENTTRACKER : BASE+'/space/rest/incidenttracker',
						REST_INCIDENTTRACKER_CUSTOMER : BASE+'/space/rest/incidenttracker/:customer',
						REST_PROBLEMS : BASE+'/space/rest/problems',

						REST_SOCOUTAGES : BASE+'/space/rest/soc_outages',
						REST_SOCINCIDENT2REVENUEIMPACT : BASE+'/space/rest/socincident2revenueimpact',
						REST_SOCSERVICES : BASE+'/space/rest/soc_services',



						REST_V1EPICS : BASE+'/space/rest/v1epics',
						REST_ROADMAPINITIATIVES_DATE : BASE+'/space/rest/roadmapinitiatives/:start',
						REST_ROADMAPINITIATIVES : BASE+'/space/rest/roadmapinitiatives',

						REST_LABELS : BASE+'/space/rest/labels',
						REST_DOMAINS : BASE+'/space/rest/domains',
						REST_CUSTOMERS : BASE+'/space/rest/customers',
						REST_COMPETITORS : BASE+'/space/rest/competitors',
						REST_ROADMAPS : BASE+'/space/rest/roadmaps',
						REST_AVAILABILITY : BASE+'/space/rest/availability',
						REST_AVAILABILITY_CALCULATE : BASE+'/space/rest/availability/calculate',

						REST_FIREREPORT : BASE+'/space/rest/firereport',
						REST_CONTENT : BASE+'/space/rest/content',
						REST_SYNCEMPLOYEEIMAGES : BASE+'/space/rest/sync/employeeimages',

/*
						REST_SYNCAVAILABILITY : BASE+'/space/rest/sync/availability',
						REST_SYNCINCIDENTS : BASE+'/space/rest/sync/incidents',
						REST_SYNCSOCOUTAGES : BASE+'/space/rest/sync/soc_outages',
						REST_SYNCSOCSERVICES : BASE+'/space/rest/sync/soc_services',
						REST_SYNCPROBLEMS : BASE+'/space/rest/sync/problems',
						REST_SYNCAPM_LOGIN : BASE+'/space/rest/sync/apm/login',
						REST_SYNCV1EPICS : BASE+'/space/rest/sync/v1epics',
						REST_SYNCV1DATA : BASE+'/space/rest/sync/v1data',
*/

						REST_APM_LOGIN : BASE+'/space/rest/apm/login',

						REST_INITIATIVES_DIFF_TRAIL : BASE+'/space/rest/initiatives_diff_trail',
						REST_ORGANIZATION : BASE+'/space/rest/organization',
						REST_ORGANIZATION_EMPLOYEE : BASE+'/space/rest/organization/employee/:name',
						REST_ORGANIZATION_EMPLOYEEBYID : BASE+'/space/rest/organization/employeeById/:employeeId',
						REST_ORGANIZATIONHISTORY : BASE+'/space/rest/organization/history/:date',
						REST_ORGANIZATIONSNAPSHOTDATES : BASE+'/space/rest/organization/snapshotdates',
						REST_ORGANIZATIONTREND : BASE+'/space/rest/organization/trend',
						REST_ORGANIZATIONTREE : BASE+'/space/rest/organizationtree',
						REST_ORGANIZATIONTREEHISTORY : BASE+'/space/rest/organizationtree/history/:date',


						REST_MAIL : BASE+'/space/rest/mail',
						REST_SWITCHCONTEXT : BASE+'/space/rest/switchcontext',
						REST_MESSAGE : BASE+'/space/rest/message',


						EXPORT_TARGETS : BASE+'/space/export/xlsx/targets',
						EXPORT_METRICS : BASE+'/space/export/xlsx/metrics',
						EXPORT_INITIATIVES : BASE+'/space/export/xlsx/initiatives',
						EXPORT_SCRUMTEAMS : BASE+'/space/export/xlsx/scrumteams',
						EXPORT_BOARDS : BASE+'/space/export/xlsx/boards',
						EXPORT_V1EPICS : BASE+'/space/export/xlsx/v1epics',
						EXPORT_ROADMAPINITIATIVES : BASE+'/space/export/xlsx/roadmapinitiatives',
						EXPORT_LABELS : BASE+'/space/export/xlsx/labels',
						EXPORT_DOMAINS : BASE+'/space/export/xlsx/domains',
						EXPORT_CUSTOMERS : BASE+'/space/export/xlsx/customers',
						EXPORT_COMPETITORS : BASE+'/space/export/xlsx/competitors',
						EXPORT_ORGANIZATION : BASE+'/space/export/xlsx/organization',
						EXPORT_PRODUCTCATALOG : BASE+'/space/export/xlsx/productcatalog',
						EXPORT_ROADMAPS : BASE+'/space/export/xlsx/roadmaps',
						EXPORT_AVAILABILITY : BASE+'/space/export/xlsx/availability',
						EXPORT_FIREREPORT : BASE+'/space/export/xlsx/firereport',
						EXPORT_CONTENT : BASE+'/space/export/xlsx/content',
						EXPORT_SOCOUTAGES : BASE+'/space/export/xlsx/soc_outages',
						EXPORT_SOCSERVICES : BASE+'/space/export/xlsx/soc_services',
						EXPORT_INCIDENTS : BASE+'/space/export/xlsx/incidents',
						EXPORT_INCIDENTSOLDSNOW : BASE+'/space/export/xlsx/incidentsoldsnow',
						EXPORT_PROBLEMS : BASE+'/space/export/xlsx/problems',

						CONFIG : BASE+'/space/config',

						TRANSCODE_BOARDS : BASE+'/space/transcode'
					};

router.get(PATH.ROOT, function(req, res, next) {res.locals.API_LIST=PATH;res.locals.REQ_PATH=req.baseUrl;res.render("api");});

router.get(PATH.REST_INITIATIVES, function(req, res, next) {findAllByName(req,res,next); });

router.get(PATH.REST_ITEMSBACKLOGPLANNINGEPICS, function(req, res, next) {getItemsBacklogPlanningEpics(req,res,next); });
router.get(PATH.REST_ITEMSBACKLOGINITIATIVES, function(req, res, next) {getItemsBacklogInitiatives(req,res,next); });
router.get(PATH.REST_ITEMSROADMAPINITIATIVES, function(req, res, next) {getItemsRoadmapInitiatives(req,res,next); });
router.get(PATH.REST_ITEMSEMPTY, function(req, res, next) {empty(req,res,next); });

router.post(PATH.REST_INITIATIVES, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_INITIATIVES, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_METRICS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_METRICS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_METRICS, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_TARGETS, function(req, res, next) {findTargets(req,res,next);});
router.post(PATH.REST_TARGETS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_TARGETS, function(req, res, next) {remove(req,res,next); });
router.get(PATH.REST_TARGETS_L1, function(req, res, next) {findTargetsByType("L1",req,res,next);});
router.get(PATH.REST_TARGETSTREE, function(req, res, next) {getTargetsTree(req,res,next);});
router.get(PATH.REST_TARGET2EMPLOYEE, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_TARGET2EMPLOYEECLUSTERED, function(req, res, next) {getTarget2EmployeeClustered(req,res,next);});
router.get(PATH.REST_EMPLOYEEBYTARGETS, function(req, res, next) {getEmployeesByTarget(req,res,next);});
router.get(PATH.REST_OUTCOMESFOREMPLOYEE, function(req, res, next) {getOutcomesForEmployee(req,res,next);});
router.get(PATH.REST_TARGETSTRACKER, function(req, res, next) {getTargetsTracker(req,res,next);});

router.get(PATH.REST_BOARDS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_BOARDS+'/:_id', function(req, res, next) {findBy_id(req,res,next);});
router.post(PATH.REST_BOARDS, function(req, res, next) {save(req,res,next); });
router.post(PATH.REST_CREATEBOARD, function(req, res, next) {saveBoard(req,res,next); });
router.delete(PATH.REST_BOARDS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_RELEASES, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_POSTITS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_LANES, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_LANETEXT, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_SCRUMTEAMS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_V1TEAMS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_PRODUCTPORTFOLIO, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_PRODUCTCATALOG, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_PROBLEMS, function(req, res, next) {findAllByName(req,res,next);});

//router.get(PATH.REST_INCIDENTS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_INCIDENTS, function(req, res, next) {findIncidents(req,res,next);});
router.get(PATH.REST_INCIDENTSOLDSNOW, function(req, res, next) {findIncidentsOldSnow(req,res,next);});

router.get(PATH.REST_INCIDENTCOMMUNICATIONTRAIL, function(req, res, next) {findIncidentCommTrail(req,res,next);});
router.get(PATH.REST_INCIDENTCHANGELOG, function(req, res, next) {findIncidentChangeLog(req,res,next);});


router.get(PATH.REST_SOCOUTAGES, function(req, res, next) {findAllByName(req,res,next);});

router.get(PATH.REST_SOCINCIDENT2REVENUEIMPACT, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_SOCINCIDENT2REVENUEIMPACT, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_SOCINCIDENT2REVENUEIMPACT, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_SOCSERVICES, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_SOCSERVICES, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_SOCSERVICES, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_INCIDENTTRACKER, function(req, res, next) {findIncidentTracker(req,res,next);});
router.get(PATH.REST_INCIDENTTRACKER_CUSTOMER, function(req, res, next) {findIncidentTracker(req,res,next);});
router.get(PATH.REST_INCIDENTSACTIVETICKER, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_INCIDENTSKPIS, function(req, res, next) {getIncidentKPIs(req,res,next);});


router.get(PATH.REST_V1EPICS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_ROADMAPINITIATIVES, function(req, res, next) {getRoadmapInitiatives(req,res,next);});
router.get(PATH.REST_ROADMAPINITIATIVES_DATE, function(req, res, next) {getRoadmapInitiatives(req,res,next);});
//


router.get(PATH.REST_LABELS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_LABELS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_LABELS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_DOMAINS, function(req, res, next) {findDomains(req,res,next); });

router.get(PATH.REST_CUSTOMERS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_CUSTOMERS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_CUSTOMERS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_COMPETITORS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_COMPETITORS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_COMPETITORS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_PRODUCTCATALOG, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_PRODUCTCATALOG, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_PRODUCTCATALOG, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_ROADMAPS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_ROADMAPS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_ROADMAPS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_AVAILABILITY, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_AVAILABILITY, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_AVAILABILITY, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_AVAILABILITY_CALCULATE, function(req, res, next) {calculateAvailability(req,res,next);});


router.get(PATH.REST_FIREREPORT, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_FIREREPORT, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_FIREREPORT, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_CONTENT, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_CONTENT, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_CONTENT, function(req, res, next) {remove(req,res,next); });


router.post(PATH.REST_MAIL, function(req, res, next) {mail(req,res,next); });
router.post(PATH.REST_MESSAGE, function(req, res, next) {message(req,res,next); });

router.post(PATH.REST_SYNCEMPLOYEEIMAGES, function(req, res, next) {syncEmployeeImages(req,res,next); });


/*
router.post(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.get(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.post(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.get(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.post(PATH.REST_SYNCSOCOUTAGES, function(req, res, next) {syncSOCOutages(req,res,next); });
router.get(PATH.REST_SYNCSOCOUTAGES, function(req, res, next) {syncSOCOutages(req,res,next); });
router.post(PATH.REST_SYNCSOCSERVICES, function(req, res, next) {syncSOCServices(req,res,next); });
router.get(PATH.REST_SYNCSOCSERVICES, function(req, res, next) {syncSOCServices(req,res,next); });


router.post(PATH.REST_SYNCV1EPICS, function(req, res, next) {syncV1Epics(req,res,next); });
router.get(PATH.REST_SYNCV1EPICS, function(req, res, next) {syncV1Epics(req,res,next); });

router.post(PATH.REST_SYNCV1DATA, function(req, res, next) {syncV1Data(req,res,next); });
router.get(PATH.REST_SYNCV1DATA, function(req, res, next) {syncV1Data(req,res,next); });

router.post(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });
router.get(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });

router.post(PATH.REST_SYNCAPM_LOGIN, function(req, res, next) {syncApm("login",req,res,next); });
router.get(PATH.REST_SYNCAPM_LOGIN, function(req, res, next) {syncApm("login",req,res,next); });
*/

router.get(PATH.REST_APM_LOGIN, function(req, res, next) {findAllByName(req,res,next); });



router.post(PATH.REST_SWITCHCONTEXT, function(req, res, next) {switchcontext(req,res,next); });
router.get(PATH.REST_SWITCHCONTEXT, function(req, res, next) {switchcontext(req,res,next); });

router.get(PATH.REST_ORGANIZATION, function(req, res, next) {findAllByName(req,res,next); });
router.get(PATH.REST_ORGANIZATION_EMPLOYEE, function(req, res, next) {findEmployeeByName(req,res,next); });
router.get(PATH.REST_ORGANIZATION_EMPLOYEEBYID, function(req, res, next) {findEmployeeById(req,res,next); });
router.get(PATH.REST_ORGANIZATIONSNAPSHOTDATES, function(req, res, next) {getOrganizationSnapshotDates(req,res,next); });
router.get(PATH.REST_ORGANIZATIONTREND, function(req, res, next) {getOrganizationTrend(req,res,next); });

router.get(PATH.REST_ORGANIZATIONTREE, function(req, res, next) {getOrganizationTree(req,res,next); });
router.get(PATH.REST_ORGANIZATIONTREEHISTORY, function(req, res, next) {getOrganizationTreeHistory(req,res,next); });


router.get(PATH.REST_ORGANIZATIONHISTORY, function(req, res, next) {
	organizationService.findEmployeesHistory(req.params.date,function(err,success){
        if(success){
            res.send(success);
            return;
        }
        return next(err);
    });
	});

router.get(PATH.REST_INITIATIVES_DIFF_TRAIL+'/:initiativeId' , function(req, res, next) {findTrailByNameForId(req,res,next);});

router.get(PATH.EXPORT_TARGETS, function(req, res, next) {exporter.excelTargets(req,res,next);});
router.get(PATH.EXPORT_METRICS, function(req, res, next) {exporter.excelMetrics(req,res,next);});
router.get(PATH.EXPORT_INITIATIVES, function(req, res, next) {exporter.excelInitiatives(req,res,next);});
router.get(PATH.EXPORT_BOARDS, function(req, res, next) {exporter.excelBoards(req,res,next);});
router.get(PATH.EXPORT_SCRUMTEAMS, function(req, res, next) {exporter.excelScrumTeams(req,res,next);});
router.get(PATH.EXPORT_V1EPICS, function(req, res, next) {exporter.excelV1Epics(req,res,next);});
router.get(PATH.EXPORT_ROADMAPINITIATIVES, function(req, res, next) {exporter.excelRoadmapInitiatives(req,res,next);});
router.get(PATH.EXPORT_LABELS, function(req, res, next) {exporter.excelLabels(req,res,next);});
router.get(PATH.EXPORT_DOMAINS, function(req, res, next) {exporter.excelDomains(req,res,next);});
router.get(PATH.EXPORT_CUSTOMERS, function(req, res, next) {exporter.excelCustomers(req,res,next);});
router.get(PATH.EXPORT_COMPETITORS, function(req, res, next) {exporter.excelCompetitors(req,res,next);});
router.get(PATH.EXPORT_PRODUCTCATALOG, function(req, res, next) {exporter.excelProductCatalog(req,res,next);});
router.get(PATH.EXPORT_ROADMAPS, function(req, res, next) {exporter.excelRoadmaps(req,res,next);});
router.get(PATH.EXPORT_AVAILABILITY, function(req, res, next) {exporter.excelAvailability(req,res,next);});
router.get(PATH.EXPORT_FIREREPORT, function(req, res, next) {exporter.excelFirereport(req,res,next);});
router.get(PATH.EXPORT_CONTENT, function(req, res, next) {exporter.excelContent(req,res,next);});
router.get(PATH.EXPORT_ORGANIZATION, function(req, res, next) {exporter.excelOrganization(req,res,next);});
router.get(PATH.EXPORT_SOCOUTAGES, function(req, res, next) {exporter.excelSOCOutages(req,res,next);});
router.get(PATH.EXPORT_SOCSERVICES, function(req, res, next) {exporter.excelSOCServices(req,res,next);});
router.get(PATH.EXPORT_INCIDENTS, function(req, res, next) {exporter.excelIncidents(req,res,next);});
router.get(PATH.EXPORT_INCIDENTSOLDSNOW, function(req, res, next) {exporter.excelIncidentsOldSnow(req,res,next);});
router.get(PATH.EXPORT_PROBLEMS, function(req, res, next) {exporter.excelProblems(req,res,next);});


router.post(PATH.TRANSCODE_BOARDS, function(req, res, next) {transcode(req,res,next); });

router.get(PATH.CONFIG, function(req, res, next) {getConfig(req,res,next);});


module.exports = router;


function empty(req, res , next){
	res.send([]);
}


/**
 * generic finder
 */
function findAllByName(req, res , next){
	var path = req.path.split("/");
	var collection = _.last(path);
    var _filterName = req.query.n;
	var _filterValue = req.query.v;
	var _filterOperator = req.query.o;
	var _filter = {};


	if (_filterName!=undefined){
		_filter[_filterName]={};
		_filter[_filterName][_filterOperator]=_filterValue;
	}

	if (collection=="targets"){
		_filter.context=config.context;
	}

	// e.g http://localhost:3000/api/space/rest/boards?filterName=name&filterOperator=$eq&filterValue=studios
	logger.debug("***** filter: "+JSON.stringify(_filter));

    //db.collection(collection).find(_filter).sort({id : 1} , function(err , success){
		db.collection(collection).find(_filter,function(err , success){
        //console.log("[DEBUG] findAllByName() for: "+_name+", Response success: "+JSON.stringify(success));
        //console.log('Response error '+err);
        if(success){
            //logger.debug("******************* success: "+success);

            //res.json(success);
						res.send(success);
            return ;//next();
        }else{
            return next(err);
        }
    });
}


/**
 * find single object by Id
 */
function findById(req, res , next){
    var path = req.path.split("/");
	// format path: /space/rest/boards/1
	// take the last from the set with last stripped ;-)
	var collection = _.last(_.initial(path));
    db.collection(collection).findOne({id:req.params.id} , function(err , success){
        logger.debug('Response success '+success);
        logger.debug('Response error '+err);
        if(success){
            res.send(success);
            return;
        }
        return next(err);
    });
}


/**
 * find incidenttracker by date
* uri looks like /api/space/rest/incidenttracker/<type>/q2-2015
* enhanced by also sending start and end of period by dates e.g. 2015-01-01_2015-02-01
 */
function findIncidentTracker(req, res , next){
	var _prios = ["P01","P08","P16","P120"];
	var _customer = req.params.customer;//_.last(path);

	var _aggregate = req.query.aggregate;
	var _prio = req.query.prios;
	var _from = req.query.from;
	var _to = req.query.to;
	var _period = req.query.period;

	//default grouping
	if (!_aggregate) _aggregate="week";
	//default period
	if (!_period) _period="NOW-30";
	if (_prio) _prios=_prio.split(",");
	if (_from && _to) _period={from:new Date(_from),to:new Date(_to)};

	// just read from DB
	if (!_customer || _customer==":customer"){
		logger.debug("**********!! NO CUSTOMER !!*********** findIncidentTracker(): _aggregate= "+_aggregate+" _period = "+_period);
		incidentTrackerService.findTrackerByDate(_aggregate,_period,_prios,function(err,data){
			if (err){
				logger.error("[error] incidentTrackerService.findTrackerByDate says: "+err.message);
			}
			else {
				incidentTrackerService.buildStatistics(data.tracker,_prios,function(err,result){
					res.send(result);
					return;
				})
			}
		});
	}
	//on the fly creation for customer
	else{
		logger.debug("**********CUSTOMER = "+_customer+" !!*********** findIncidentTracker(): _aggregate= "+_aggregate+" _period = "+_period);
		incidentTrackerService.createIncidenttrackerByDate(_aggregate,_period,_prios,_customer,function(err,result){
			if (err){
				logger.error("[error] incidentTrackerService.createIncidenttrackerByDate says: "+err.message);
			}
			else {
				res.send(result);
				return;
			}
		})
	}
}

/**
 * find by generic key
 */
function findByKey(key,req, res , next){
    var path = req.path.split("/");
	// format path: /space/rest/boards/1
	// take the last from the set with last stripped ;-)
	var collection = _.last(_.initial(path));

	logger.debug("findbyKey: key: "+key+" value: "+req.params[key]);
	logger.debug("collection: "+collection);

	var _query = {};
	_query[key]=req.params[key];

    db.collection(collection).find(_query , function(err , success){

        logger.debug('Response error '+err);
        if(success){
            logger.debug('Response success '+success);
						res.send(success);
            return;
        }
        return next(err);
    });
}

/**
 * find single object by _id
 */
function findBy_id(req, res , next){
    console.log("...path: "+req.path);


    var path = req.path.split("/");
	// format path: /space/rest/boards/1
	// take the last from the set with last stripped ;-)
	var collection = _.last(_.initial(path));
	// a string
	var _id = req.params._id;

	console.log("...looking for collection: "+collection+ "_id: "+req.params._id);

    db.collection(collection).findOne({_id:mongojs.ObjectId(_id)}, function(err , success){
        logger.debug('Response success '+success);
        logger.debug('Response error '+err);
        if(success){
            res.send(success);
            return;
        }
        return next(err);
    });
}

function getItemsBacklogPlanningEpics(req,res,next){
	var context = config.context;
	logger.debug("------ getItemsPlanningEpics called: ");
	var v1Service = spaceServices.V1Service;
	if (req.query.context) context=req.query.context;

	v1Service.getPlanningBacklogsByEpics({},function(err,planningepics){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(planningepics);
			return;
		}
	})
}
function getItemsBacklogInitiatives(req,res,next){
	var context = config.context;
	logger.debug("------ getItemsInitiatives called: ");
	var v1Service = spaceServices.V1Service;
	if (req.query.context) context=req.query.context;

	v1Service.getPlanningBacklogsByInitiatives({},function(err,initiatives){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(initiatives);
			return;
		}
	})
}

function _extractFilter(types,req){
	var _elements;
	var _filter={};

	for (var t in types){
		var type = types[t];
		if (req.query["filter_"+type]){
			_elements = req.query["filter_"+type].split(",");
			for (var e in _elements){
				_elements[e]=new RegExp(_elements[e]);
			}
			_filter[type]={$in:_elements};
		}
	}
	return _filter;
}


function getItemsRoadmapInitiatives(req,res,next){
	var context = config.context;

	var _filterTypes=["Targets","Customers","Markets","Status","Product"];
	var _filter=_extractFilter(_filterTypes,req);

	logger.debug("------ api.getItemsRoadmapInitiatives called: filter: "+_filter);
	var v1Service = spaceServices.V1Service;
	if (req.query.context) context=req.query.context;
	// example for mobile first roadmap
	v1Service.getRoadmapInitiatives(_filter,function(err,roadmapinitiatves){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(roadmapinitiatves);
			return;
		}
	})
}


/**
*/
function findIncidents(req,res,next){
	  logger.debug("findIncidents() called");

		var incService = spaceServices.IncidentService;
		incService.find({},{openedAt:-1},function(err,data){
				if (err){
					logger.error("[error] findincidents says: "+err)
					res.send(err);
				}
				res.send(data);
				return;
		});
}

function findIncidentsOldSnow(req,res,next){
	  logger.debug("findIncidents() called");

		var incService = spaceServices.IncidentService;
		incService.findOld({},{openedAt:-1},function(err,data){
				if (err){
					logger.error("[error] findincidentsOldSnow says: "+err)
					res.send(err);
				}
				res.send(data);
				return;
		});
}


/**
*/
function findIncidentCommTrail(req,res,next){
	  logger.debug("findIncidentCommTrail() called");

		var incService = spaceServices.IncidentService;
		/*incService.find({},{openedAt:-1},function(err,data){
				if (err){
					logger.error("[error] findincidents says: "+err)
					res.send(err);
				}
				res.send(data);
				return;
		});
		*/
}


/**
*/
function findIncidentChangeLog(req,res,next){
	  var _id = req.params.id;

		logger.debug("findIncidentChangeLog() called: id = "+_id);

		var incService =spaceServices.IncidentService;
		incService.findChangeLog(_id,function(err,data){
				if (err){
					logger.error("[error] findincidents says: "+err)
					res.send(err);
				}

				res.send(data);
				return;
		});

}

/**
*/
function findDomains(req,res,next){
	  logger.debug("findDomains() called");
		db.collection("domains").find().sort({id : 1} , function(err , success){
        if(success){
            res.send(_transformDomains(success));
            return ;//next();
        }else{
            return next(err);
        }
    });

}


function _transformDomains(data){
		var _domains = [];

		for (var d in data){
			var _d = {};
			_d._id = data[d]._id;
			_d.domainName = data[d].domainName;

			if (data[d].httpLog !== undefined) _d.httpLogStatus = data[d].httpLog.statusCode;
			if (data[d].httpLog !== undefined) _d.httpLogRedirect = data[d].httpLog.redirectTarget;
			if (data[d].httpsLog !== undefined) _d.httpsLogStatus = data[d].httpsLog.statusCode;
			_d.aRecords = data[d].aRecords;

			_domains.push(_d);
		}
		return _domains;

}


function getRoadmapInitiatives(req,res,next){
	var v1Service = spaceServices.V1Service;
	var _start = req.params.start;

	if (_start) _start = new Date(_start);
	else _start = null;
	v1Service.getRoadmapInitiatives(new Date(_start),function(err,roadmap){
		res.send(roadmap);
	})

}

function getIncidentKPIs(req,res,next){
  logger.debug("getIncidentKPIs ------------");

  var baseline = {type:"baseline",range:config.targets.kpis.incidents.baseline.openedAt};
  logger.debug("baseline: "+JSON.stringify(baseline));
  var target = {type:"target",range:config.targets.kpis.incidents.target.openedAt};
  logger.debug("target: "+JSON.stringify(target));

	incidentService.getKPIs(baseline,target,function(err,kpis){
			logger.debug("XXXXXXXXXXXXXXXXXXXXXXXXXXXX ----------------------- KPIs: "+JSON.stringify(kpis));
			res.send(kpis);
	});

}


function findTargetsByType(type,req,res,next){
	var targetService = spaceServices.TargetService;
	var context = config.context;
	if (req.query.context) context=req.query.context;
	var _period;
	if (req.params.period) _period = req.params.period;
	else _period = targetService.getPeriod();

	var _function;
	if (type=="L1") _function = "getL1ByPeriod";
	else if (type=="L2") _function = "getL2ByPeriod";

	targetService[_function](context,_period,function(err,targets){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(targets);
			return;
		}
	})
}


function findTargets(req,res,next){
	var targetService = spaceServices.TargetService;
	var context = config.context;
	if (req.query.context) context=req.query.context;
	var _period;
	if (req.params.period) _period = req.params.period;
	else _period = targetService.getPeriod();

	targetService.getAllByPeriod(context,_period,function(err,targets){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(targets);
			return;
		}
	})
}

/**
*/
function getTargetsTree(req,res,next){
  logger.debug("getTargetsTree() called");

	var context = config.context;
	if (req.query.context) context=req.query.context;
	logger.debug("[api.getTargetsTree] context: "+context);

	var targetService =spaceServices.TargetService;
	targetService.getL2Tree(context,function(err,result){
		if(err){
			logger.error("error: "+err.message);
			res.send("error: "+err.message);
		}
		else{
			res.send(result);
			return;
		}
	})
}

/**
 * find single object by Id
 */
function findEmployeeByName(req, res , next){
    var collection = "organization";

		var _firstName="";
		var _lastName="";

    var _name = req.params.name.split(" ");

		if (_name.length==2){
			_firstName = _name[0];
			_lastName = _name[1];
		}
		if (_name.length==3){
			_firstName = _name[0];
			_lastName = _name[1]+" "+_name[2];
		}
    db.collection(collection).findOne({"First Name":_.capitalize(_firstName),"Last Name":_.capitalize(_lastName)} , function(err , success){
      logger.debug('Response success '+success);
      logger.debug('Response error '+err);
      if(success){
        res.send(success);
        return;
      }
      else {
        res.send(err);
        return;
			}
      return next(err);
    });
}

/**
 * find single object by Id
 */
function findEmployeeById(req, res , next){
    var orgService = spaceServices.OrganizationService;

		var _employeeId="";

    var _employeeId = req.params.employeeId;

		logger.debug("++++++++++++++employeeId: "+_employeeId);

		//orgService.findEmployeeById(_employeeId , function(err , success){
		orgService.findEmployeeById(_employeeId,function(err,success){
      if(success){
      	logger.debug('[success]: '+success);
				res.send(success);
        return;
      }
      else {
        logger.debug('[error]: '+err);
				res.send(err);
        return;
			}
      return next(err);
    });
}



function getTargetsTracker(req, res , next){
  var _period = req.params.period;
	var _kpi = req.query.kpi;
	var collection="targetstracker"+_period+_kpi;
	db.collection(collection).find(function(err,tracker){
			res.send(tracker);
	});



}


function getTarget2EmployeeClustered(req, res , next){
  var period = req.params.period;
	var orgService = spaceServices.OrganizationService;
	orgService.findTarget2EmployeeMappingClusteredByPeriod(period,function(err,result){
		res.send(result);
	})
}

function getOutcomesForEmployee(req,res,next){
	var orgService = spaceServices.OrganizationService;
	var period = req.params.period;
	var _employeeId = req.params.employeeId;
	orgService.findOutcomesForEmployeeByPeriod(_employeeId,period,function(err,result){

		res.send(result);
	})

}

function getEmployeesByTarget(req, res , next){
  var orgService = spaceServices.OrganizationService;
	var period = req.params.period;

	// to just pick a specific L2 target pass it via query
	var pickL2 = req.query.pickL2;
	var showTargetTree = req.query.showTargetTree;
	var showEmployeeTree = req.query.showEmployeeTree;

	orgService.findTarget2EmployeeMappingByPeriod(period,function(err,mapping){
		//logger.debug("...all good: "+JSON.stringify(mapping));
		orgService.getEmployeesByTargetsByPeriod(mapping,pickL2,showTargetTree,showEmployeeTree,period,function(err,success){
			if(success){
				//logger.debug('[success]: '+success);
				res.send(success);
				return;
			}
			else {
				//logger.debug('[error]: '+err);
				res.send(err);
				return;
			}
			return next(err);
		});
	})

}

/**
 * gets all change trail documents
 * slected by refID which is the id of the changed entity
 */
function findTrailByNameForId(req, res , next){
  logger.debug("*** find Trail for :"+req.params.initiativeId);
  var path = req.path.split("/");
	var collection = _.last(_.initial(path));
  db.collection(collection).find({refId:mongojs.ObjectId(req.params.initiativeId)} , function(err , success){
    logger.debug('Response success '+success);
    logger.debug('Response error '+err);
    if(success){
        res.send(success);
        return;
    }
    return next(err);
	});
}

/**
* saves a kanban / roadmap board
 PROTOTYPE !!!!!

 TODO !!!
currently ONLY work for CREATE
=> when used for save in update case => it messes all UP :-)

*/
function saveBoard(req, res , next){
	var boardService = require('../services/BoardService');
	var context;
	if (req.session.CONTEXT) context = req.session.CONTEXT;
	else context = res.config.context;
  var board;
	try{
		board = JSON.parse(req.body.itemJson);

	} catch (e){
		logger.error("crash: "+e.message);
	}

	//0 fixing some _id shit
	// http://stackoverflow.com/questions/13031541/mongoerror-cannot-change-id-of-a-document
	if ( board._id && ( typeof(board._id) === 'string' ) ) {
		logger.debug("[DEBUG] fixing mongDB _id issue....");
		board._id = mongojs.ObjectId.createFromHexString(board._id);
	}


	var _timestamp = new Date();
  board.createDate=_timestamp;
	var _groupby = board.groupby.split(",");
	var _filterTypes=["Targets","Customers","Markets","Status","Product"];
	var _filter=_extractFilter(_filterTypes,req);
	logger.debug("----------------filter: "+JSON.stringify(_filter));
	if (_groupby.length!=3){
		logger.error("groupby currently must be 3 levels");
		//default
		_groupby=["Product","BusinessBacklog","Number"];
	}
	boardService.save(board,function(err,success){
		logger.debug("saved OK: _id: "+success._id);
		// and create a thumbnail
		/*
		_generateBoardThumbnail(success._id,req.getBaseUrl(),function(err,result){
				logger.debug("result: "+result);
				res.send({_id:success._id});
		})
		*/
			res.send({_id:success._id});
	})
}

/**helper
*/
function _createItem(epic,groupby,boardName){
	logger.debug("======== _createItem: epic: "+epic.Number+ " - groupby: "+groupby);
	logger.debug("====== epic:PlanningBacklog: "+epic.PlanningBacklog);
	//split / join needed e.g. if businessbacklog is used we need to replace "/"
	if (!epic[groupby[0]]) epic[groupby[0]]=boardName;
	if (!epic[groupby[1]]) epic[groupby[1]]="empty";
	if (!epic[groupby[2]]) epic[groupby[2]]="empty";

	var _group1 = epic[groupby[0]].split("/").join("|");
	var _group2 = epic[groupby[1]].split("/").join("|");
	var _group3 = epic[groupby[2]].split("/").join("|");
	var _product = epic.Product;
	var _path = boardName+"/"+_group1+"/"+_group2+"/"+_group3;
	logger.debug("====== epic:lanePath: "+_path);

	// !!!! path needs 3 levels right now at least
	if (!_product) _product="No Product";
	var _itemView={sublaneOffset:0,size:7,accuracy:10,lanePath:_path}
	var _item ={itemRef:epic.Number,itemView:_itemView};
	return _item;
}

/**experimental dynamic thumbnail creation
* if that works - can be moved to a more generic service
*/
function _generateBoardThumbnail(boardId,baseUrl,callback){
	var phantom = require('phantom');

	var _url=baseUrl+"/kanban/"+boardId;
	phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any",function (ph) {
	  ph.createPage(function (page) {
	    page.open(_url, function (status) {
        setTimeout(function() {
	        page.set("zoomFactor",0.2);
	        var _name = 'public/images/boards/thumbs/'+boardId+'.png';
					page.render(_name, {format: 'png', quality: '100'},function(){
           	ph.exit();
						callback(null,"OK: "+_name);
	        });
	      },1000);
	      });
	    });
 });

}

/**
 * generic save handler
 */
function save(req, res , next){

		logger.debug("*********************** save.... "+config.context);

    var context;
		if (req.session.CONTEXT) context = req.session.CONTEXT;
		else context = config.context;

		var jsondiffpatch=require('jsondiffpatch');
    var path = req.path.split("/");
		var _collection = _.last(path);
		logger.debug("*********************** save POST _collection: "+_collection);
    var items = JSON.parse(req.body.itemJson);
    var _timestamp = new Date();
    // now lets iterate over the array
    logger.debug("*********************** AFTER parse: "+_collection+"  items: "+items.length);
		var _newid;

		var async = require('async');
		async.eachSeries(items, function (item, done){
			logger.debug("[async.series: now lets do what we havto do :-) ...*item: "+JSON.stringify(item)); // print the key
			logger.debug(">>>>> setting context of item: "+context);
			item.context = context;
			var _old;
			var _diff;

			async.series([
			function(callback){
				logger.debug("[async.series - 1] preparing stuff ...");
				//0 fixing some _id shit
				// http://stackoverflow.com/questions/13031541/mongoerror-cannot-change-id-of-a-document
				if ( item._id && ( typeof(item._id) === 'string' ) ) {
					logger.debug("[DEBUG] fixing mongDB _id issue....");
					item._id = mongojs.ObjectId.createFromHexString(item._id);
				}
				logger.debug("[DEBUG] createDate: "+item.createDate);
				item.changeDate=_timestamp;

				// 1) setting timestamps
				if (!(item.createDate)){
					item.createDate=_timestamp;
					logger.debug("--->>>>>>>>>>no create date found: "+item.createDate);
					callback(null,'one');
				}
				else {
					// 2) get old value before update
					db.collection(_collection).findOne({_id:mongojs.ObjectId(item._id)}, function(err , success){
						_old=success;
						logger.debug("************_old: "+JSON.stringify(_old));
						_diff = jsondiffpatch.diff(_old,item);
						logger.debug("************diff: "+JSON.stringify(_diff));
						callback(null,'one');
					});
				}
			},

			function (callback){
				// 2) and update stuff
				logger.debug("[async.series - 2] going to update collection ...");
				db.collection(_collection).update({_id:mongojs.ObjectId(item._id)},item,{upsert:true} , function(err , success){
					if(success){
						logger.info("[success] updatedExisting: "+success.updatedExisting+ " success:"+JSON.stringify(success));
							if(success.updatedExisting===false){
								//_newid = success.upserted[0]._id;
								_newid = success.upserted;
								logger.info("[success] _newid = "+_newid);
							}
							callback(null,'two');
						}
				});
			},

			function(callback){
				logger.debug("[async.series - 3] going to insert trail ..."+_collection+"_diff_trail");

				if(_old){
					logger.debug("[async.series - 3] trail ..._old: "+_old);
					db.collection(_collection+"_diff_trail").insert({timestamp:_timestamp,refId:_old._id,diff:_diff,old:_old}	 , function(err , success){
						logger.debug('Response success '+success);
						logger.debug('Response error '+err);
						if(success){
							logger.info("[DEBUG] SUCCESS insert trail: ");
						}
						else {
							logger.error("[DEBUG] ERROR insert trail failed"+JSON.stringify(err));
						}
						callback(null,'three');
					});
				}
				else{
					logger.debug("on INSERT NEW - we have no trail..._newid: "+_newid);
					callback(null,'three');
				}
				done();
			}
		]);
		},function(err){
		if(err){
			logger.error(err);
		}
		else{
			logger.debug('------------------------- asyn.each ALL done: _newid: '+_newid);
			res.send({_id:_newid});
			return;
		}
	});
}


/**
 * generic mail handler
 *  text:    mail.text+signatureText,
    from:    config.mailer.from,
    to:      mail.to,
    cc:      mail.cc,
    subject: subjectPrefix+mail.subject,

 */
function mail(req,res,next){
  logger.debug("*********************** mail: "+req.body.mail);
  var _mail = JSON.parse(req.body.mail);
  var mailer = require('../services/MailService');
	mailer.sendText(_mail);
	res.send({});
	return;
}



function message(req,res,next){
  logger.debug("*********************** real-time message emit: "+JSON.stringify(req.body));
	if (config.emit.space_messages =="on"){
		var _message=req.body;
		_message.desktop={
			desktop:true,
			icon:"/images/icons/msg_"+_message.type+".png"
		};
		_message.history={menu:true};

		var io = require('../io.js');
		io.sockets.emit("space.message",{msg:_message});
	}

	res.send({});
	return;
}


function syncEmployeeImages(req,res,next){
    logger.debug("*********************** lets sync images of employees... ");

    var orgService = spaceServices.OrganizationService;
    orgService.syncEmployeeImages(req,res,function(){

		logger.debug("???");
	});
}


function calculateAvailability(req,res,next){
    logger.debug("*********************** calculate availabilty: ");
    var avCalcService = require ('../services/AvailabilityCalculatorService');


		var from = req.query.from;// "2015-01-01 00:00:00";
		var to = req.query.to;//"2015-04-01 00:00:00";

		if (!from) from = moment().year()+"-01-01";
		if (!to) to = moment().format("YYYY-MM-DD");


		var filter;
		if (req.query.customer){
			_customer = req.query.customer;//"bwin" or "pmu" or "danske spil",...;
			filter = {customer:_customer};
		}
		else filter = {customer:"* ALL *"};

	  avCalcService.calculateOverall(from, to, filter,function(avDataOverall){
				avCalcService.calculateExternal(from,to,filter,function(avDataExternal){
			//logger.debug("------------------------------------------------------ data.snapShotDate: "+data.snapshotDate);
			res.send({"filter:":filter,"avOverall":avDataOverall,"avExternal":avDataExternal});
	});
	});

}

function getOrganizationTrend(req,res,next){
		orgService = spaceServices.OrganizationService;
		orgService.getOrganizationTrend({},function(err,data){
			logger.debug("data: "+data);
			res.send(data);
		});
}

function getOrganizationTree(req,res,next){
	var _employee =req.query.employee;
	if (_employee){
			organizationService.getTreeBelow(_employee,function(err,data){
			if (err) res.send(err.message);
			else if (data) res.send(data)
		});
	}
	else{
		organizationService.getTree(function(err,data){
			if (err) res.send(err.message);
			else if (data) res.send(data)
		});
	}
}


function getOrganizationTreeHistory(req,res,next){
	var _date = req.params.date;
	var _employee =req.query.employee;
	if (_employee){
		organizationService.getTreeHistoryBelow(_date,_employee,function(err,data){
			if (err) res.send(err.message);
			else if (data) res.send(data);
		});
	}
	else{
		organizationService.getTreeHistory(_date,function(err,data){
			if (err) res.send(err.message);
			else if (data) res.send(data);
		});
	}
}





function getOrganizationSnapshotDates(req,res,next){
	// get all org instance dates for the menu
	// ** this should go somewhere else ;-)
	logger.debug("getsnapshot dates....");
	orgService = spaceServicesOrganizationService;
	orgService.getOrganizationHistoryDates(function(err,data){
		logger.debug("data: "+data);
		res.send(data);
	});


}




function _checkCreateDate(item){
	logger.debug("----------------------------------- _checkCreateDate (item:"+item.name+" called");

	if (!(item.createDate)){
		item.createDate=_timestamp;
		logger.debug("--->>>>>>>>>>no create date found: "+item.createDate);
	}
	else {
		logger.debug("[DEBUG] createDate: "+item.createDate);
		item.changeDate=_timestamp;
	}

	return item;
}




/**
 * delete
 */
function remove(req, res , next){

    logger.debug("*********************** remove DELETE: action= "+req.body.action);
    var path = req.path.split("/");
	var collection = _.last(path);


    var items = JSON.parse(req.body.itemJson);
    logger.debug("*********************** itemJson= "+items[0]);

    // now lets iterate over the array
    var async = require('async');
	async.each(items, function (item, callback){
		logger.debug("*item: "+item); // print the key

		db.collection(collection).remove({_id:mongojs.ObjectId(item)} , function(err , success){if (success) {logger.debug("--- remove: id:"+item+" [SUCCESS]");}});

		callback(); // tell async that the iterator has completed

	}, function(err) {
		logger.debug('iterating done');
		res.send({});
		return;
	});

}


/** rsvg based transcode
 * https://github.com/walling/node-rsvg
 *
 * data is posted :
 * <input type="hidden" id="format" name="format" value="">
   <input type="hidden" id="data" name="data" value="">
   <input type="hidden" id="context" name="context" value="">
   <input type="hidden" id="svg_width" name="svg_width" value="">
   <input type="hidden" id="svg_height" name="svg_height" value="">
   <input type="hidden" id="png_scale" name="png_scale" value="">
  */

function transcode(req,res,next){
	logger.debug("*********transcode request: ");
	var Rsvg = require('rsvg').Rsvg;
	var fs = require('fs');

	var _body = req.body;
	var _svg = _body.svg;
	var _format = req.query.format;
	var _width = req.query.width;
	var _height = req.query.height;
	var _scale = req.query.scale;
	var _context = req.query.context;

	//logger.debug("*********transcode request: format: "+JSON.stringify(_body));

	//logger.debug("*********transcode request: "+JSON.stringify(_body));
	logger.debug("*********transcode request: width,height:"+_width+" , "+_height);
	logger.debug("*********transcode request: body:"+_svg);


	//data ='<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect x="10" y="10" height="100" width="100" style="stroke:#ff0000; fill: #0000ff"/></svg>';


	var moment = require('moment');
	var timestamp = moment(new Date());
	var timestamp_string = timestamp.format("YYYY-MM-DD HH_mm_ss");

	var fileName="files/boards/"+_context+"_space_transcoded_"+timestamp_string;

	if (_format=="svg"){
		  fs.writeFile("public/"+fileName+".svg",_body.svg);
	}
	else{


		var svg = new Rsvg(_svg);
		  console.log('SVG width: ' + svg.width);
		  console.log('SVG height: ' + svg.height);
			//console.log('SVG : ' + _svg);



		  fs.writeFile("public/"+fileName+"."+_format, svg.render({
		    format: _format,
		    width: svg.width,
		    height: svg.height
		  }).data);
	}

	//res.set("Content-Disposition","attachment; filename=\"" + fileName + "\"");
	//res.set("Cache-Control", "no-cache");
	//res.type(_format);


	res.send(req.getBaseUrl()+"/"+fileName+"."+_format);
	return;
}


function switchcontext(req,res,next){
	var context = require('../services/ContextService');

	logger.debug("switchcontext called: "+req.body.context);

	if (req.body.context){
		context.switch(req.body.context,function(context){

				logger.debug("*** context: "+JSON.stringify(context));

				logger.debug("*** session.AUTH: "+req.session.AUTH);
				logger.debug("*** session.CONTEXT: "+req.session.CONTEXT);

				req.session.CONTEXT = context.name;
				logger.debug("*** session.CONTEXT: "+req.session.CONTEXT);
		});
	}
	res.send("switchcontext");
	//next();
}


/** exposes server side config relevant for client
 *
 */
function getConfig(req,res,next){

	var config = require('config');
	res.send(config);

}
