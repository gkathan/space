/**
  /upload routes
*/
var mongojs = require("mongojs");
var nodeExcel = require('excel-export');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

var DB="kanbanv2";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);


var BASE = "";




/* GET api listing. */
var PATH_ROOT ="/";
var PATH = {
						ROOT : PATH_ROOT,
						REST_INITIATIVES : BASE+'/kanbanv2/rest/initiatives',
						REST_METRICS : BASE+'/kanbanv2/rest/metrics',
						REST_TARGETS : BASE+'/kanbanv2/rest/targets',
						REST_BOARDS : BASE+'/kanbanv2/rest/boards',
						REST_RELEASES : BASE+'/kanbanv2/rest/releases',
						REST_LANETEXT : BASE+'/kanbanv2/rest/lanetext',
						REST_POSTITS : BASE+'/kanbanv2/rest/postits',
						REST_LANES : BASE+'/kanbanv2/rest/lanes',
						REST_SCRUMTEAMS : BASE+'/kanbanv2/rest/scrumteams',
						REST_PRODUCTPORTFOLIO : BASE+'/kanbanv2/rest/productportfolio',
						REST_PRODUCTCATALOG : BASE+'/kanbanv2/rest/productcatalog',
						REST_INCIDENTS : BASE+'/kanbanv2/rest/incidents',
						REST_V1EPICS : BASE+'/kanbanv2/rest/v1epics',
						
						REST_INITIATIVES_DIFF_TRAIL : BASE+'/kanbanv2/rest/initiatives_diff_trail',
						REST_ORG : BASE+'/kanbanv2/rest/org/:date',
						
						EXPORT_TARGETS : BASE+'/kanbanv2/export/xlsx/targets',
						EXPORT_METRICS : BASE+'/kanbanv2/export/xlsx/metrics',
						EXPORT_INITIATIVES : BASE+'/kanbanv2/export/xlsx/initiatives',
						EXPORT_SCRUMTEAMS : BASE+'/kanbanv2/export/xlsx/scrumteams',
						EXPORT_BOARDS : BASE+'/kanbanv2/export/xlsx/boards',
						EXPORT_V1EPICS : BASE+'/kanbanv2/export/xlsx/v1epics',

						CONFIG : BASE+'/kanbanv2/config',

						TRANSCODE_BOARDS : BASE+'/kanbanv2/transcode'
						
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


router.get(PATH.REST_BOARDS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_BOARDS+'/:id', function(req, res, next) {findById(req,res,next);});
router.post(PATH.REST_BOARDS, function(req, res, next) {save(req,res,next); });
router.delete(PATH.REST_BOARDS, function(req, res, next) {remove(req,res,next); });

router.get(PATH.REST_RELEASES, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_POSTITS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_LANES, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_LANETEXT, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_SCRUMTEAMS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_PRODUCTPORTFOLIO, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_PRODUCTCATALOG, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_INCIDENTS, function(req, res, next) {findAllByName(req,res,next);});
router.get(PATH.REST_V1EPICS, function(req, res, next) {findAllByName(req,res,next);});

router.get(PATH.REST_ORG, function(req, res, next) {
	db.collection("org").findOne({oDate:req.params.date} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
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
	
	// e.g http://localhost:3000/api/kanbanv2/rest/boards?filterName=name&filterOperator=$eq&filterValue=studios
	
	console.log("***** filter: "+JSON.stringify(_filter));
	
	
	
    
    db.collection(collection).find(_filter).sort({id : 1} , function(err , success){
        //console.log("[DEBUG] findAllByName() for: "+_name+", Response success: "+JSON.stringify(success));
        //console.log('Response error '+err);
        if(success){
            console.log("******************* success: "+success);
            
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
	
	// format path: /kanbanv2/rest/boards/1
	// take the last from the set with last stripped ;-)
	var collection = _.last(_.initial(path));
	
    db.collection(collection).findOne({id:req.params.id} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(success);
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
    console.log("*** find Trail for :"+req.params.initiativeId);
    var path = req.path.split("/");
	var collection = _.last(_.initial(path));
	
    db.collection(collection).find({refId:mongojs.ObjectId(req.params.initiativeId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(success);
            return;
        }
        return next(err);
    })
}

 

/**
 * autoinc stuff
 * http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
 */
 /* legacy
function getNextSequence(name,callback) {
   console.log("[DEBUG] > getNextSequence called for: "+name);
   db.collection(name+"_counter").findAndModify(
          {
            query: { _id: name+"Id" },
            update: { $inc: { seq: 1 } },
            new: true
          }
   ,function (error,success){
	  console.log("[DEBUG] > seq= "+success.seq);
	  
	  callback(success.seq);   
   });
   
   //return ret.seq;
}
*/

/*
 
 for each item in items
	series (former asy methd)
		* check item.create date
		* try to find existing item (old version)
		* 
 
*/


/**
 * async pattern to handle a list of items to be processed
 * inspired by http://book.mixu.net/node/ch7.html (chapter 7.2.1)
 * 
 * 
 * todo: think about using async module: https://github.com/caolan/async
 */
function save(req, res , next){
    //var items = JSON.parse(req.params.itemJson);
    
    console.log("*************[DEBUG] save POST:");
    var items = JSON.parse(req.body.itemJson);
    
    var path = req.path.split("/");
	var _collection = _.last(path);
	
    
    var jsondiffpatch=require('jsondiffpatch');
    
    var results = [];
    var _timestamp = new Date();

    console.log("*************[DEBUG] save POST: collection= "+_collection+" itemJson: "+JSON.stringify(items));


	// Async task 
	function async(item, callback) {
	    console.log("----------------------------------- async(item:"+item.name+" called");

	    console.log("[DEBUG] save POST: collection= "+_collection+" itemJson: "+JSON.stringify(item));
		if (!(item.createDate)){
			item.createDate=_timestamp;
			//TODO refactor to ASYNC handling !!!!
			//item.id = getNextSequence("initiativeId");
			console.log("--->>>>>>>>>>no create date found: "+item.createDate);
			//console.log("--->>>>>>>>>>autoinc id: "+item.id);
		}
		else console.log("[DEBUG] createDate: "+item.createDate);
		
		item.changeDate=_timestamp;

		console.log("************_item: "+item.ExtId);
		
		// get old before update
		var _old;
		var _diff;

		db.collection(_collection).findOne({_id:mongojs.ObjectId(item._id)}, function(err , success){
			//console.log('FindOne() Response success '+success);
			//console.log('FindOne() Response error '+err);
			_old=success;
			console.log("************_old: "+JSON.stringify(_old));
			_diff = jsondiffpatch.diff(_old,item);
			console.log("************diff: "+JSON.stringify(_diff));
			/*
			if (!_old){ 
				console.log("[DEBUG] > no _old found -> concluding this will be an INSERT, need to get a seq.....");
				getNextSequence(_collection,restOfTheFunction);
				return;
			}
			else console.log("[DEBUG] ok - old item found ...");
		*/
		restOfTheFunction();	
			
		function restOfTheFunction(seq){	
			console.log("++++++++++++++++++++++ restOfTheFunction() called +++++++++++++++++++++++++++");
			if (seq){
				console.log("[DEBUG] > restOfTheFunction() called with seq ="+seq);
				item.id=seq;
			}
			
			// http://stackoverflow.com/questions/13031541/mongoerror-cannot-change-id-of-a-document
			if ( item._id && ( typeof(item._id) === 'string' ) ) {
				console.log("[DEBUG] fixing mongDB _id issue....");
			    item._id = mongojs.ObjectId.createFromHexString(item._id)
			}

			
			console.log("[DEBUG] going to update collection ...");

			db.collection(_collection).update({_id:mongojs.ObjectId(item._id)},item,{upsert:true} , function(err , success){
				//console.log('Response success '+success);
				//console.log('Response error '+err);
				console.log("[DEBUG] updated collection ...");
				if(success){
					console.log("[DEBUG] SUCCESS updatedExisting: "+success.updatedExisting);
					
					//insert trail (in case of update)
					if (success.updatedExisting){
						console.log("[DEBUG] going to insert trail ...");
						db.collection(_collection+"_diff_trail").insert({timestamp:_timestamp,refId:_old._id,diff:_diff,old:_old}	 , function(err , success){
							//console.log('Response success '+success);
							console.log('Response error '+err);
							if(success){
								callback(success);
							}
							//return next(err);
							
						})
					}
					callback(success);
				}
				else {
					console.log("[DEBUG] ERROR no success returned.. what to do now ????"+JSON.stringify(err));
					callback(err);
				}
				
				//return next(err);
			})
		}
		
		});
		
	  
	}

    // Final task 
	function final() { 
		console.log('************************************************************************* Done', results);
		res.send();
		//return next();;
	}
    
	
	function series(item) {
	  console.log(".series()...");
	  if(item) {
		async( item, function(result) {
		  results.push(result);
		  return series(items.shift());
		});
	  } else {
		return final();
	  }
	}
	
	series(items.shift());
    
}

/**
 * generic save handler
 */
function saveNG(req, res , next){
    
    console.log("*********************** save POST: action= "+req.body.action);
    var path = req.path.split("/");
	var collection = _.last(path);

    
    var items = JSON.parse(req.body.itemJson);
    
    
    // now lets iterate over the array 
    var async = require('async');
	async.each(items, function (item, callback){ 
		console.log("*item: "+item); // print the key
		
		db.collection(collection).remove({_id:mongojs.ObjectId(item)} , function(err , success){if (success) {console.log("--- remove: id:"+item+" [SUCCESS]");}})
		
		callback(); // tell async that the iterator has completed

	}, function(err) {
		console.log('iterating done');
		res.send({});
		return;
	});  
    
}

/* legacy
function _getNextSequence(name,callback) {
   console.log("[DEBUG] > getNextSequence called for: "+name);
   db.collection(name+"_counter").findAndModify(
          {
            query: { _id: name+"Id" },
            update: { $inc: { seq: 1 } },
            new: true
          }
   ,function (error,success){
	  console.log("[DEBUG] > seq= "+success.seq);
	  
	  callback(success.seq);   
   });
   
   //return ret.seq;
}
*/


function _checkCreateDate(item){
	console.log("----------------------------------- _checkCreateDate (item:"+item.name+" called");
	
	if (!(item.createDate)){
		item.createDate=_timestamp;
		console.log("--->>>>>>>>>>no create date found: "+item.createDate);
	}
	else {
		console.log("[DEBUG] createDate: "+item.createDate);
		item.changeDate=_timestamp;
	}
	
	return item;
}


/* legacy 
function _checkExists(item,collectionName){
	console.log("----------------------------------- _checkExists (item:"+item.name+" called");
	
	// get old before update
	var _old;
	var _diff;

	db.collection(collectionName).findOne({_id:mongojs.ObjectId(item._id)}, function(err , success){
		_old=success;
		console.log("************_old: "+JSON.stringify(_old));
		_diff = jsondiffpatch.diff(_old,item);
		console.log("************diff: "+JSON.stringify(_diff));
		
		
		if (!_old){ 
			console.log("[DEBUG] > no _old found -> concluding this will be an INSERT, need to get a seq.....");
			getNextSequence(_collection,restOfTheFunction);
			return;
		}
		else console.log("[DEBUG] ok - old item found ...");
	
	return item;
	
	})
}

*/


/**
 * delete
 */
function remove(req, res , next){
    
    console.log("*********************** remove DELETE: action= "+req.body.action);
    var path = req.path.split("/");
	var collection = _.last(path);

    
    var items = JSON.parse(req.body.itemJson);
    console.log("*********************** itemJson= "+items[0]);
    
    // now lets iterate over the array 
    var async = require('async');
	async.each(items, function (item, callback){ 
		console.log("*item: "+item); // print the key
		
		db.collection(collection).remove({_id:mongojs.ObjectId(item)} , function(err , success){if (success) {console.log("--- remove: id:"+item+" [SUCCESS]");}})
		
		callback(); // tell async that the iterator has completed

	}, function(err) {
		console.log('iterating done');
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
		{caption:'vision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'cluster',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'theme',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'group',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'target',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'outcome',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'baseline',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'measure',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'by when',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'link',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'owner',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'responsible',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'comments',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
		
	];
    
    _generateAndSendExcel("targets",conf,req,res,next);
    
}

  

/**
 * generate metrics excel
 */
function excelMetrics(req, res , next){
	var conf ={};
	
	
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
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
		{caption:'Number',type:'sring',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
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
 * generate scrumteams excel
 */
function excelScrumTeams(req, res , next){
	var conf ={};
	
	
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
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
 * generates initiatives excel
 */
function excelInitiatives(req, res , next){
	var conf ={};
    
    
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
 		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
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
			
			if (conf._field){
				
				conf.rows = _createDataRows(conf,success[0][conf._field]);
			}
			else {
				conf.rows = _createDataRows(conf,success);
			}
			var result = nodeExcel.execute(conf);
			res.set('Content-Type', 'application/vnd.openxmlformats');
			res.set("Content-Disposition", "attachment; filename=" + collection+".xlsx");
			res.end(result, 'binary');
		}
    });
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
			 
             //console.log(JSON.stringify(row));
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
		//console.log("JSON: "+JSON.stringify(success[m]));
		for (var f in _fields){
			var _column = _fields[f];
			//console.log("+ column: "+_column);
			if (! data[d][_column]) _row.push("");
			else _row.push(data[d][_column]);
		}
		_list.push(_row);
		//console.log("** row: "+_row);
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
	
	var fileName=_context+"_kanbanv2_transcoded_"+timestamp_string;

	res.set("Content-Disposition","attachment; filename=\"" + fileName + "\"");
	res.set("Cache-Control", "no-cache");
	res.type(_format);

	res.send(_s.data)
}




/** exposes server side config relevant for client 
 *
 */
function getConfig(req,res,next){

	var config = require('config');
	res.send(config);

}
