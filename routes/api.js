/**
  /api routes
*/
var mongojs = require("mongojs");
var nodeExcel = require('excel-export');
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
						REST_INCIDENTTRACKER : BASE+'/space/rest/incidenttracker',
						REST_INCIDENTTRACKER_DATE : BASE+'/space/rest/incidenttracker/:date',
						REST_PROBLEMS : BASE+'/space/rest/problems',

						REST_V1EPICS : BASE+'/space/rest/v1epics',
						REST_LABELS : BASE+'/space/rest/labels',
						REST_DOMAINS : BASE+'/space/rest/domains',
						REST_CUSTOMERS : BASE+'/space/rest/customers',
						REST_COMPETITORS : BASE+'/space/rest/competitors',
						REST_PRODUCTCATALOG : BASE+'/space/rest/productcatalog',
						REST_ROADMAPS : BASE+'/space/rest/roadmaps',
						REST_AVAILABILITY : BASE+'/space/rest/availability',
						REST_FIREREPORT : BASE+'/space/rest/firereport',
						REST_CONTENT : BASE+'/space/rest/content',
						REST_SYNCEMPLOYEEIMAGES : BASE+'/space/rest/sync/employeeimages',
						REST_SYNCAVAILABILITY : BASE+'/space/rest/sync/availability',
						REST_SYNCINCIDENTS : BASE+'/space/rest/sync/incidents',
						REST_SYNCPROBLEMS : BASE+'/space/rest/sync/problems',
						REST_SYNCAPM_BETPLACEMENT : BASE+'/space/rest/sync/apm/betplacement',

						REST_INITIATIVES_DIFF_TRAIL : BASE+'/space/rest/initiatives_diff_trail',
						REST_ORGANIZATION : BASE+'/space/rest/organization',
						REST_ORGANIZATION_EMPLOYEE : BASE+'/space/rest/organization/employee/:name',
						REST_ORGANIZATIONHISTORY : BASE+'/space/rest/organization/history/:date',
						REST_ORGANIZATIONSNAPSHOTDATES : BASE+'/space/rest/organization/snapshotdates',

						REST_MAIL : BASE+'/space/rest/mail',
						REST_SWITCHCONTEXT : BASE+'/space/rest/switchcontext',


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

						CONFIG : BASE+'/space/config',

						TRANSCODE_BOARDS : BASE+'/space/transcode'
					};

router.get(PATH.ROOT, function(req, res, next) {res.locals.API_LIST=PATH;res.locals.REQ_PATH=req.baseUrl;res.render("api")});

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

router.get(PATH.REST_INCIDENTTRACKER, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_INCIDENTTRACKER, function(req, res, next) {save(req,res,next);});
router.delete(PATH.REST_INCIDENTTRACKER, function(req, res, next) {delete(req,res,next);});
router.get(PATH.REST_INCIDENTTRACKER_DATE, function(req, res, next) {findByDate(req,res,next);});
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

router.get(PATH.REST_FIREREPORT, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_FIREREPORT, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_FIREREPORT, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_CONTENT, function(req, res, next) {findAllByName(req,res,next);});
router.post(PATH.REST_CONTENT, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_CONTENT, function(req, res, next) {remove(req,res,next); });


router.post(PATH.REST_MAIL, function(req, res, next) {mail(req,res,next); });

router.post(PATH.REST_SYNCEMPLOYEEIMAGES, function(req, res, next) {syncEmployeeImages(req,res,next); });
router.post(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.get(PATH.REST_SYNCAVAILABILITY, function(req, res, next) {syncAvailability(req,res,next); });
router.post(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.get(PATH.REST_SYNCINCIDENTS, function(req, res, next) {syncIncidents(req,res,next); });
router.post(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });
router.get(PATH.REST_SYNCPROBLEMS, function(req, res, next) {syncProblems(req,res,next); });

router.post(PATH.REST_SYNCAPM_BETPLACEMENT, function(req, res, next) {syncApm("betplacement",req,res,next); });
router.get(PATH.REST_SYNCAPM_BETPLACEMENT, function(req, res, next) {syncApm("betplacement",req,res,next); });


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
    })



	});

router.get(PATH.REST_INITIATIVES_DIFF_TRAIL+'/:initiativeId' , function(req, res, next) {findTrailByNameForId(req,res,next);});

router.get(PATH.EXPORT_TARGETS, function(req, res, next) {excelTargets(req,res,next)});
router.get(PATH.EXPORT_METRICS, function(req, res, next) {excelMetrics(req,res,next)});
router.get(PATH.EXPORT_INITIATIVES, function(req, res, next) {excelInitiatives(req,res,next);});
router.get(PATH.EXPORT_BOARDS, function(req, res, next) {excelBoards(req,res,next);});
router.get(PATH.EXPORT_SCRUMTEAMS, function(req, res, next) {excelScrumTeams(req,res,next);});
router.get(PATH.EXPORT_V1EPICS, function(req, res, next) {excelV1Epics(req,res,next);});
router.get(PATH.EXPORT_LABELS, function(req, res, next) {excelLabels(req,res,next);});
router.get(PATH.EXPORT_DOMAINS, function(req, res, next) {excelDomains(req,res,next);});
router.get(PATH.EXPORT_CUSTOMERS, function(req, res, next) {excelCustomers(req,res,next);});
router.get(PATH.EXPORT_COMPETITORS, function(req, res, next) {excelCompetitors(req,res,next);});
router.get(PATH.EXPORT_PRODUCTCATALOG, function(req, res, next) {excelProductCatalog(req,res,next);});
router.get(PATH.EXPORT_ROADMAPS, function(req, res, next) {excelRoadmaps(req,res,next);});
router.get(PATH.EXPORT_AVAILABILITY, function(req, res, next) {excelAvailability(req,res,next);});
router.get(PATH.EXPORT_FIREREPORT, function(req, res, next) {excelFirereport(req,res,next);});
router.get(PATH.EXPORT_CONTENT, function(req, res, next) {excelContent(req,res,next);});
router.get(PATH.EXPORT_ORGANIZATION, function(req, res, next) {excelOrganization(req,res,next);});


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

	if (_filterName==undefined) _filter = null;

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
    })
}



/**
 * find by generic key
 */
function findByDate(req, res , next){
    var path = req.path.split("/");
	// format path: /space/rest/boards/1
	// take the last from the set with last stripped ;-)
	var collection = _.last(_.initial(path));

	var _date = _.last(path);

	var _quarter = _parseQuarter(_date);
	logger.debug("quarter: "+_quarter)

	// ok lets inspect what kind of date is specified
	// we support currently:
	// 1) just plain year "2015"
	// 2) quarter of a year "2015q1"
	// 3) a day "2015-03-21"

  var _year = parseInt(_date);
	logger.debug("year:" +_year);
	var _from;
	var _to;

	if ( _year != NaN && _year >2010){
		_from = new Date(_date+"-01-01");
		_to = new Date(_date+"-12-31");
		logger.debug("[year]:" +_year+ "[from]: "+_from+" [to]: "+_to);
	}
	else if (_quarter[0] != "Invalid date" && _quarter[1] != "Invalid date"){
		_from = new Date(_quarter[0]);
		_to = new Date(_quarter[1]);
		logger.debug("[quarter]:" +_quarter+ "[from]: "+_from+" [to]: "+_to);
	}
	else {
		logger.error("no way");
	}

	logger.debug("findbyDate: value: "+_.last(path));
	logger.debug("collection: "+collection);



 var _query = {date : { $gte : _from,$lte : _to}};

    db.collection(collection).find( _query, function(err , success){
        logger.debug('Response success '+success);
        logger.debug('Response error '+err);
        if(success){
            res.send(success);
            return;
        }
        return next(err);
    })

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
    })
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
    })
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

			_domains.push(_d)
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
    })
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
					item._id = mongojs.ObjectId.createFromHexString(item._id)
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
							if(success.updatedExisting==false){
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
    var mail = JSON.parse(req.body.mail);
    var mailer = require('../services/MailService');
	mailer.sendText(mail);
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

			logger.debug("???");
			res.send("incidents: "+JSON.stringify(data));
	});
}

function syncProblems(req,res,next){
    logger.debug("*********************** lets sync problems from snow... ");
		var _url = config.sync.problem.url;
    var probSyncService = require ('../services/ProblemSyncService');
    logger.debug("*********************** probservice instantiated ");
	  probSyncService.sync(_url,function(data){

			logger.debug("???");
			res.send("problems: "+JSON.stringify(data));
	});
}

function syncApm(process,req,res,next){
    logger.debug("*********************** lets sync appdynamics process: "+process);
		var _url = config.sync.apm[process].url;

    var apmSyncService = require ('../services/ApmSyncService');
    logger.debug("*********************** apmservice instantiated, url: "+_url);
	  apmSyncService.sync(_url,function(data){

			logger.debug("???");
			res.send("apm says: "+JSON.stringify(data));
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

		db.collection(collection).remove({_id:mongojs.ObjectId(item)} , function(err , success){if (success) {logger.debug("--- remove: id:"+item+" [SUCCESS]");}})

		callback(); // tell async that the iterator has completed

	}, function(err) {
		logger.debug('iterating done');
		res.send({});
		return;
	});

}




/**
 * generate targets excel
 */
function excelTargets(req, res , next){
	var conf ={};

    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'profit',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'rag',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'vision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'cluster',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'theme',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'group',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'icon',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'icon_theme',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dashboardTop',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dashboardDetail',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'target',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directMetric',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directMetricScale',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directTarget',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directTime',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'outcome',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'baseline',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'measure',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'by when',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'link',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'owner',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'responsible',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'comments',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contributors',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sponsor',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'start',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'end',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}

	];

    _generateAndSendExcel("targets",conf,req,res,next);

}

/**
 * generate targets excel
 */
function excelRoadmaps(req, res , next){
	var conf ={};

    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'area',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'endDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'version',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell}

	];

    _generateAndSendExcel("roadmaps",conf,req,res,next);

}


/**
 * generate metrics excel
 */
function excelMetrics(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dimension',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'class',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'intervalStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'intervalEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'forecastDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'number',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'scale',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sustainable',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'reforecast',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'targets',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'direction',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("metrics",conf,req,res,next);
}

/**
 * generate boards excel
 */
function excelBoards(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'sring',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'vision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'subvision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'mission',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'height',type:'number',width:4,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'width',type:'number',width:4,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'itemScale',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'itemFontScale',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'laneboxRightWidth',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'endDate',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'WIPWindowDays',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("boards",conf,req,res,next);
}

/**
 * generate boards excel
 */
function excelV1Epics(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Number',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Name',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Status',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scope',type:'string',width:25,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Swag',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'PlannedEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'PlannedStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Health',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Capitalizable',type:'string',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'CreatedBy',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ChangedBy',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'CategoryName',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Risk',type:'number',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Value',type:'number',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HealthComment',type:'string',width:2,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}


	];
	conf._field="epics";

    _generateAndSendExcel("v1epics",conf,req,res,next);
}

/**
 * generate productcatalog excel
 */
function excelProductCatalog(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Type',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Offering',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Family',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Name',type:'string',width:25,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'number',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Version',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Owner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Comments',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DependsOn',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ConsumedBy',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell}


	];

    _generateAndSendExcel("productcatalog",conf,req,res,next);
}




/**
 * generate scrumteams excel
 */
function excelScrumTeams(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Teamname',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Location',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Vertical',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Product',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'SubProduct',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ProductOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'APO',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'WorkingMode',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'TeamCreateDate',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Kkills',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Technologies',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scope',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Teamsize',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Podmaster',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'IsCrosscomponent',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Self-formation?',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
   _generateAndSendExcel("scrumteams",conf,req,res,next);
}


/**
 * generate scrumteams excel
 */
function excelFirereport(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'path',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'year',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'count',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contact',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}


	];

   _generateAndSendExcel("firereports",conf,req,res,next);
}




/**
 * generate scrumteams excel
 */
function excelV1Teams(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Business Backlog',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Program',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Mascot',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Sprint Schedule',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}

	];

    _generateAndSendExcel("v1teams",conf,req,res,next);
}


/**
 * generate scrumteams excel
 */
function excelIncidenttracker(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'P1',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'P8',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell}

	];

    _generateAndSendExcel("incidenttracker",conf,req,res,next);
}

/**
 * generate scrumteams excel
 */
function excelContent(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'headline',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'content',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'date',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}

	];

    _generateAndSendExcel("content",conf,req,res,next);
}


/**
 * generate labels excel
 */
function excelLabels(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'market',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'brand',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'label',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("labels",conf,req,res,next);
}


/**
 * generate domains excel
 */
function excelDomains(req, res , next){
	console.log("******************* domain excel export");
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'domainName',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'aRecords',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpLogStatus',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpLogRedirect',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpsLogStatus',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("domains",conf,req,res,next);
}



/**
 * generate organization excel
 */
function excelOrganization(req, res , next){
	console.log("******************* organization excel export");
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Last Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'First Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Gender',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Email Address',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Contract Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Person Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Assignment Category',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Job',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Corporate Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Local Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Contractual Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Position',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Function',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Vertical',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Location',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employing Legal Entity',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Organization',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Organization Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employee is a Supervisor?',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Cost Centre',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Assignment Cost Code',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor Full Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor E-Mail',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HRBP Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HRBP Full Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 1',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 2',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 3',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Date First Hired',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Projected Termination Date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Actual Termination Date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("organization",conf,req,res,next);
}






/**
 * generate availability excel
 */
function excelAvailability(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'year',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'week',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'unplannedYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'plannedYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'totalYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("availability",conf,req,res,next);
}


/**
 * generate customers excel
 */
function excelCustomers(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'scope',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'market',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contact',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'key accounter',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("customers",conf,req,res,next);
}

/**
 * generate competitors excel
 */
function excelCompetitors(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'offer',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'marketcap',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stock',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stocklink',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'products',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'markets',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];

    _generateAndSendExcel("competitors",conf,req,res,next);
}


/**
 * generates initiatives excel
 */
function excelInitiatives(req, res , next){
	var conf ={};


    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
 		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ExtId',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ExtNumber',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name2',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isCorporate',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'onKanban',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'backlog',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'bm',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'theme',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'themesl',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sublane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sublaneOffset',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'planDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'actualDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1plannedStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1plannedEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1launchDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'state',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'health',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'healthComment',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'progress',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'size',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Type',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'cost',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Swag',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'benefit',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dependsOn',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'accuracy',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'productOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'businessOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'programLead',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DoD',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DoR',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'createDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'changeDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}

   ];

    _generateAndSendExcel("initiatives",conf,req,res,next);
}


function _generateAndSendExcel(collection,conf,req,res,next){
	db.collection(collection).find().sort({_id : 1} , function(err , success){
		if(success){

			if (collection=="domains"){
				success = _transformDomains(success);
			}

			if (conf._field){
				conf.rows = _createDataRows(conf,success[0][conf._field]);
			}
			else {
				conf.rows = _createDataRows(conf,success);
			}
			var _now = moment().format("YYYYMMDD");

			var result = nodeExcel.execute(conf);
			res.set('Content-Type', 'application/vnd.openxmlformats');
			res.set("Content-Disposition", "attachment; filename=s p a c e_export_" + collection+"_"+_now+".xlsx");
			res.end(result, 'binary');
		}
    });
}

/**
* parses a string to indiciate a quarter of a year and returns array with start end end date
* @param quarter: "Q1-2014"
*/
function _parseQuarter(quarter){
	var dateParsed;
	var splitted = quarter.split('-');
	var quarterEndMonth =  splitted[0].charAt(1) * 3;
	var quarterStartMonth = (quarterEndMonth - 3)+1;
	var _start = moment(quarterStartMonth + ' ' + splitted[1],'MM YYYY').format('YYYY-MM-DD');
	var _end = moment(quarterEndMonth + ' ' + splitted[1],'MM YYYY').endOf('month').format('YYYY-MM-DD');

	logger.debug(" quarterStartMonth= "+quarterStartMonth +"quarterEndMonth = "+quarterEndMonth+ "splitted[1]"+splitted[1])
	logger.debug("q start: "+_start);
	logger.debug("q end: "+_end);
	return [_start,_end];
}


function _stripCrap(object){
	if (typeof object =="string"){
		//strip out all HTML tags - http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
		object = object.replace(/(<([^>]+)>)/ig,"");
		object = object.replace(/[^ -~]/g, "");

		//object = object.replace(/(\r\n|\n|\r)/gm,"");
		/*object = object.replace(/(\u001c)/g, "");
		object = object.replace(/(\u001a)/g, "");
		object = object.replace(/(\u001b)/g, "");
		object = object.replace(/(\u001e)/g, "");
		object = object.replace(/(\u001f)/g, "");
		object = object.replace(/(\u0013)/g, "");
		*/
	}
	return object;
}


/** row formatting
 *
 */
function _formatCell(row, cellData,eOpt){
             if (eOpt.rowNum%2 ==0)
				eOpt.styleIndex=1;
			 else
				eOpt.styleIndex=3;

             //logger.debug(JSON.stringify(row));
             return _stripCrap(cellData);
        }

/**
 * extracts the captions from a conf arrax
 * needed for deterministically create the data for CSV export
 */
function _getCaptionArray(conf){
   var _fields = new Array();

   for (c in conf.cols){
	   _fields.push(conf.cols[c].caption);
   }

   return _fields;
}

/**
 * builds array of values for excel export
 */
function _createDataRows(conf,data){
	var _fields = _getCaptionArray(conf);
	var _list = new Array();

	for (var d in data){
		var _row = new Array();
		//logger.debug("JSON: "+JSON.stringify(data[d]));
		for (var f in _fields){
			var _column = _fields[f];
			//logger.debug("+ column: "+_column+ "... data: "+data[d][_column]);
			if (! data[d][_column]) _row.push("");
			else _row.push(data[d][_column]);
		}
		_list.push(_row);
		//logger.debug("** row: "+_row);
	}
	return _list;
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

	res.send(_s.data)
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
		})
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
