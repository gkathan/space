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


var incidentService = require('../services/IncidentService');
var exporter = require('../services/ExcelExportService');

var BASE = "";

/* GET api listing. */
var PATH_ROOT ="/";
var PATH = {
						ROOT : PATH_ROOT,
						REST_INITIATIVES : BASE+'/space/rest/initiatives',
						REST_METRICS : BASE+'/space/rest/metrics',
						REST_TARGETS : BASE+'/space/rest/targets',
						REST_TARGETS_TYPE : BASE+'/space/rest/targets/:type',
						REST_TARGETSTREE : BASE+'/space/rest/targetstree',

						REST_BOARDS : BASE+'/space/rest/boards',

						REST_RELEASES : BASE+'/space/rest/releases',
						REST_LANETEXT : BASE+'/space/rest/lanetext',
						REST_POSTITS : BASE+'/space/rest/postits',
						REST_LANES : BASE+'/space/rest/lanes',
						REST_SCRUMTEAMS : BASE+'/space/rest/scrumteams',
						REST_V1TEAMS : BASE+'/space/rest/v1teams',
						REST_PRODUCTPORTFOLIO : BASE+'/space/rest/productportfolio',
						REST_PRODUCTCATALOG : BASE+'/space/rest/productcatalog',

						REST_INCIDENTS : BASE+'/space/rest/incidents',
						REST_SOCINCIDENTS : BASE+'/space/rest/socincidents',
						REST_SOCSERVICES : BASE+'/space/rest/socservices',

						REST_INCIDENTTRACKER : BASE+'/space/rest/incidenttracker',
						REST_INCIDENTTRACKER_DATE : BASE+'/space/rest/incidenttracker/:date',
						REST_PROBLEMS : BASE+'/space/rest/problems',

						REST_V1EPICS : BASE+'/space/rest/v1epics',
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
						REST_SYNCAVAILABILITY : BASE+'/space/rest/sync/availability',
						REST_SYNCINCIDENTS : BASE+'/space/rest/sync/incidents',
						REST_SYNCSOCINCIDENTS : BASE+'/space/rest/sync/soc_incidents',
						REST_SYNCPROBLEMS : BASE+'/space/rest/sync/problems',
						REST_SYNCAPM_LOGIN : BASE+'/space/rest/sync/apm/login',

						REST_APM_LOGIN : BASE+'/space/rest/apm/login',

						REST_INITIATIVES_DIFF_TRAIL : BASE+'/space/rest/initiatives_diff_trail',
						REST_ORGANIZATION : BASE+'/space/rest/organization',
						REST_ORGANIZATION_EMPLOYEE : BASE+'/space/rest/organization/employee/:name',
						REST_ORGANIZATIONHISTORY : BASE+'/space/rest/organization/history/:date',
						REST_ORGANIZATIONSNAPSHOTDATES : BASE+'/space/rest/organization/snapshotdates',

						REST_MAIL : BASE+'/space/rest/mail',
						REST_SWITCHCONTEXT : BASE+'/space/rest/switchcontext',
						REST_MESSAGE : BASE+'/space/rest/message',


						EXPORT_TARGETS : BASE+'/space/export/xlsx/targets',
						EXPORT_METRICS : BASE+'/space/export/xlsx/metrics',
						EXPORT_INITIATIVES : BASE+'/space/export/xlsx/initiatives',
						EXPORT_SCRUMTEAMS : BASE+'/space/export/xlsx/scrumteams',
						EXPORT_BOARDS : BASE+'/space/export/xlsx/boards',
						EXPORT_V1EPICS : BASE+'/space/export/xlsx/v1epics',
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
						EXPORT_SOCINCIDENTS : BASE+'/space/export/xlsx/socincidents',

						CONFIG : BASE+'/space/config',

						TRANSCODE_BOARDS : BASE+'/space/transcode'
					};

router.get(PATH.ROOT, function(req, res, next) {res.locals.API_LIST=PATH;res.locals.REQ_PATH=req.baseUrl;res.render("api");});

router.get(PATH.REST_INITIATIVES, function(req, res, next) {findAllByName(req,res,next); });
router.post(PATH.REST_INITIATIVES, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_INITIATIVES, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_METRICS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_METRICS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_METRICS, function(req, res, next) {remove(req,res,next); });


router.get(PATH.REST_TARGETS, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_TARGETS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_TARGETS, function(req, res, next) {remove(req,res,next); });
router.get(PATH.REST_TARGETS_TYPE, function(req, res, next) {findByKey("type",req,res,next);});
router.get(PATH.REST_TARGETSTREE, function(req, res, next) {getTargetsTree(req,res,next);});


router.get(PATH.REST_BOARDS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_BOARDS+'/:_id', function(req, res, next) {findBy_id(req,res,next);});
router.post(PATH.REST_BOARDS, function(req, res, next) {save(req,res,next); });
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
router.get(PATH.REST_SOCINCIDENTS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_SOCSERVICES, function(req, res, next) {findAllByName(req,res,next);});

router.get(PATH.REST_INCIDENTTRACKER, function(req, res, next) {findAllByName(req,res,next);});
//router.post(PATH.REST_INCIDENTTRACKER, function(req, res, next) {save(req,res,next);});
//router.delete(PATH.REST_INCIDENTTRACKER, function(req, res, next) {delete(req,res,next);});
router.get(PATH.REST_INCIDENTTRACKER_DATE, function(req, res, next) {findIncidenttrackerByDate(req,res,next);});

router.get(PATH.REST_V1EPICS, function(req, res, next) {findAllByName(req,res,next);});
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
router.post(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.get(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.post(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.get(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.post(PATH.REST_SYNCSOCINCIDENTS, function(req, res, next) {syncSOCIncidents(req,res,next); });
router.get(PATH.REST_SYNCSOCINCIDENTS, function(req, res, next) {syncSOCIncidents(req,res,next); });

router.post(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });
router.get(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });

router.post(PATH.REST_SYNCAPM_LOGIN, function(req, res, next) {syncApm("login",req,res,next); });
router.get(PATH.REST_SYNCAPM_LOGIN, function(req, res, next) {syncApm("login",req,res,next); });

router.get(PATH.REST_APM_LOGIN, function(req, res, next) {findAllByName(req,res,next); });



router.post(PATH.REST_SWITCHCONTEXT, function(req, res, next) {switchcontext(req,res,next); });
router.get(PATH.REST_SWITCHCONTEXT, function(req, res, next) {switchcontext(req,res,next); });

router.get(PATH.REST_ORGANIZATION, function(req, res, next) {findAllByName(req,res,next); });
router.get(PATH.REST_ORGANIZATION_EMPLOYEE, function(req, res, next) {findEmployeeByName(req,res,next); });
router.get(PATH.REST_ORGANIZATIONSNAPSHOTDATES, function(req, res, next) {getOrganizationSnapshotDates(req,res,next); });

router.get(PATH.REST_ORGANIZATIONHISTORY, function(req, res, next) {
	db.collection("organizationhistory").findOne({oDate:req.params.date} , function(err , success){
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
router.get(PATH.EXPORT_SOCINCIDENTS, function(req, res, next) {exporter.excelSOCIncidents(req,res,next);});


router.post(PATH.TRANSCODE_BOARDS, function(req, res, next) {transcode(req,res,next); });

router.get(PATH.CONFIG, function(req, res, next) {getConfig(req,res,next);});


module.exports = router;




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

	_filter[_filterName]={};
	_filter[_filterName][_filterOperator]=_filterValue;

	if (_filterName===undefined) _filter = null;

	// e.g http://localhost:3000/api/space/rest/boards?filterName=name&filterOperator=$eq&filterValue=studios
	logger.debug("***** filter: "+JSON.stringify(_filter));

    db.collection(collection).find(_filter).sort({id : 1} , function(err , success){
        //console.log("[DEBUG] findAllByName() for: "+_name+", Response success: "+JSON.stringify(success));
        //console.log('Response error '+err);
        if(success){
            logger.debug("******************* success: "+success);

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
 */
function findIncidenttrackerByDate(req, res , next){
	var path = req.path.split("/");
	var _date = _.last(path);
	var _aggregate = req.query.aggregate;
	//default grouping
	if (!_aggregate){
		_aggregate="weekly";
	}

	incidentService.findTrackerByDate(_aggregate,_date,function(err,data){
			if (err){
				logger.warn("[error] incidentService.findTrackerByDate says: "+err.message);
			}
			else {
				res.send(data);
				return;
			}
	});
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

/**
*/
function findIncidents(req,res,next){
	  logger.debug("findIncidents() called");

		var incService = require("../services/IncidentService");
		incService.find(function(data){
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

/**
*/
function getTargetsTree(req,res,next){
	  logger.debug("getTargetsTree() called");
		db.collection("targets").find().sort({id : 1} , function(err , success){
        //console.log("[DEBUG] findAllByName() for: "+_name+", Response success: "+JSON.stringify(success));
        //console.log('Response error '+err);
        if(success){

						for (var s in success){
							console.log("name: "+success[s].name);
							if (success[s].name ===undefined) success[s].name=success[s].id;
							console.log("** name: "+success[s].name);
						}

						var us = require('underscore');
						us.nst = require('underscore.nest');
						//var tree = _.nest(success);

						var nestLevels = ["context","theme","group"];

						var tree = us.nst.nest(success,nestLevels);

						logger.debug("******************* success: "+tree);

            res.send(tree.children);
            return ;//next();
        }else{
            return next(err);
        }
    });

}

/**
 * find single object by Id
 */
function findEmployeeByName(req, res , next){
    var collection = "organization";
    var _name = req.params.name.split(" ");
    db.collection(collection).findOne({"First Name":_.capitalize(_name[0]),"Last Name":_.capitalize(_name[1])} , function(err , success){
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
 * generic save handler
 */
function save(req, res , next){
		var context;
		if (req.session.CONTEXT) context = req.session.CONTEXT;
		else context = res.config.context;

		var jsondiffpatch=require('jsondiffpatch');
    var path = req.path.split("/");
		var _collection = _.last(path);
    var items = JSON.parse(req.body.itemJson);
    var _timestamp = new Date();
    // now lets iterate over the array
    logger.debug("*********************** save POST _collection: "+_collection);
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
								_newid = success.upserted[0]._id;
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
			icon:"/images/messages/msg_"+_message.type+".png"
		};

		req.app.io.emit("message",{msg:_message});
	}

	res.send({});
	return;
}


function syncEmployeeImages(req,res,next){
    logger.debug("*********************** lets sync images of employees... ");

    var orgService = require ('../services/OrganizationService');
    orgService.syncEmployeeImages(req,res,function(){

		logger.debug("???");
	});
}

function syncAvailability(req,res,next){

    var avSyncService = require ('../services/AvailabilitySyncService');
		var _urls = config.sync.availability.url;
		logger.debug("*********************** lets sync availability from avreports service... urls: "+_urls);


	  avSyncService.sync(_urls,function(av){

			logger.debug("av:"+JSON.stringify(av));
			res.send("availability: "+JSON.stringify(av));
	});


}

function syncIncidents(req,res,next){
    logger.debug("*********************** lets sync incidents from snow... ");
		var _url = config.sync.incident.url;
    var incSyncService = require ('../services/IncidentSyncService');
    logger.debug("*********************** incservice instantiated ");
	  incSyncService.sync(_url,function(data){


			res.send("incidents: "+JSON.stringify(data));
	});
}

function syncSOCIncidents(req,res,next){
    logger.debug("*********************** lets sync SOC incidents from avreport... ");
		var _url = config.sync.soc_incidents.url;
    var soc_incSyncService = require ('../services/SOCIncidentsSyncService');
    logger.debug("*********************** SOC incservice instantiated ");
	  soc_incSyncService.sync(_url,function(data){


			res.send("SOC incidents: "+JSON.stringify(data));
	});
}

function syncProblems(req,res,next){
    logger.debug("*********************** lets sync problems from snow... ");
		var _url = config.sync.problem.url;
    var probSyncService = require ('../services/ProblemSyncService');
    logger.debug("*********************** probservice instantiated ");
	  probSyncService.sync(_url,function(data){


			res.send("problems: "+JSON.stringify(data));
	});
}

function syncApm(process,req,res,next){
    logger.debug("*********************** lets sync appdynamics process: "+process);
    var apmSyncService = require ('../services/ApmSyncService');

	  apmSyncService.sync(function(data){
			logger.debug("------------------------------------------------------ data.snapShotDate: "+data.snapshotDate);
			res.send("apm says: "+JSON.stringify(data));
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




function getOrganizationSnapshotDates(req,res,next){
	// get all org instance dates for the menu
	// ** this should go somewhere else ;-)
	logger.debug("getsnapshot dates....");
	orgService = require('../services/OrganizationService');
	orgService.getOrganizationHistoryDates(function(data){
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
	var Rsvg = require('rsvg').Rsvg;

	var _svg_raw = req.param("data");
	var _format = req.param("format");
	var _width = req.param("svg_width");
	var _height = req.param("svg_height");
	var _context = req.param("context");



	var svg = new Rsvg(_svg_raw);

	var _s = svg.render({
		format: _format,
		width: _width,
		height: _height
	});


	var moment = require('moment');
	var timestamp = moment(new Date());
	var timestamp_string = timestamp.format("YYYY-MM-DD HH_mm_ss");

	var fileName=_context+"_space_transcoded_"+timestamp_string;

	res.set("Content-Disposition","attachment; filename=\"" + fileName + "\"");
	res.set("Cache-Control", "no-cache");
	res.type(_format);

	res.send(_s.data);
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
