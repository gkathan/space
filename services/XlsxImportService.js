var config = require('config');
var xlsx_json = require('xlsx-to-json');
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var mongojs = require('mongojs');
var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);


var winston=require('winston');
var logger = winston.loggers.get('space_log');

var appRoot = require('app-root-path');

/**
 * 
 * converts xlsx to json
 */
exports.convertXlsx2Json = function convertXlsx2Json (filename) {
	// here we can do our processing
	var _originalFilename = filename;
	var _jsonfilename = filename+".json";
	var _base = appRoot+ '/temp/';
	var _outputFile =  _base +_jsonfilename;
	var _inputFile = _base+filename;
	logger.debug("******************** output: "+_outputFile);
	//1) convert xlsx2json - we do not write a physical output file only use the data stream
	xlsx_json({
		input: _inputFile ,
		output: null
	}, function(err, json) {
		if(err) {
			logger.error(err);
		}
		else{
			logger.debug("***and inserting into mongoDB...");
			logger.debug("***************** [DEBUG]: _originalFilename: "+_originalFilename);
			// check is an object with 4 fields; {data,date,boardDate,fillblanks}
			var _check = _validateName(_originalFilename);
			var _collection = _check.collection;
			var _date = _check.date;
			var _boarddate = _check.boarddate;
			var _fillblanks = _check.fillblanks;
			var _handlers =[];
			var _dropBeforeInsert=false;
			var _plainElements = config.import.plainTypes;
			
			logger.debug("***************** [DEBUG]: _collection: "+_collection);
			if (_collection=="portfoliogate") _handlers = [_handlePortfolioGate];
			else if (_collection=="organization"){
				
				// 1) add to organizationhistory
				// 2) and overwrite latest into organization
				_handlers = [_handleOrganization,_handleOrganizationHistory];
				
				
			}
			else if (_.indexOf(_plainElements,_collection) >-1){
				 _handlers = [_handlePlain];
				 _dropBeforeInsert = true;
			}
			logger.info("***************** [DEBUG]: _collection: "+_collection+" _date: "+_date);
			
			// huhuuuu that's a quite complicated async handling peiece of code ;-)
			if (_date){
				var async = require('async');
				// execute all handlers specified 
				async.each(_handlers, function (_handler, callback){ 
					_handler(json,_date,_boarddate,_fillblanks,function(_data){
						
						async.series([
							function(callback){
								logger.debug("+++++++ _handler: "+_getFunctionName(_handler));
								logger.debug("****async.series: 1) check if we should drop...");
								
								// ok - this is also not beautiful ;-)
								if (_getFunctionName(_handler) == "_handleOrganization") {
									_dropBeforeInsert=true;
								}
								
								if (_dropBeforeInsert){
									  logger.debug("****async.series: 1) yep - lets drop:"+_collection);
									 db.collection(_collection).drop();
									}
								callback();
							},
							function(callback){	
								
								// ok - this is not beautiful - but for now it works
								// some more generic way of handling historization of data like orga.....
								if (_getFunctionName(_handler) == "_handleOrganizationHistory") {
									_collection="organizationhistory";
								}
								logger.debug("****async.series: 2) insert stuff: "+_collection);
								logger.debug("****async.series: 2) _data.length: "+_data.length);
								
								db.collection(_collection).insert(_data);
								
								
								done = true;
								callback();
							},
							function(callback){	
								logger.debug("****async.series: 3) check if we should send update mail");
								if (_collection=="portfoliogate"){
									logger.debug("****async.series: 3) yep - lets send portfolioupdate");
									_sendPortfolioUpdate(config.notifications.portfolioupdate);
								}
								callback();
							},
							function(callback){
								logger.debug("****async.series: 4) and in any case delete the first tmp file: "+_inputFile);
								fs.unlink(_inputFile,function(err,succes){
									callback();
								});
							},
							function(callback){
								
							}

						]);
					callback();	
					});
					
				});
			}
			else{
				logger.debug("NONO - wrong file and name!!!");
				done = false;
			}
		}
	});
}


var _getFunctionName = function (fn) {
   return (fn + '').split(/\s|\(/)[1];
};

		
/**
 * checks format for portfoliogate xlsx upload
 * must be: <collectionname>_<year>-<month>-<day>.xlsx
 * optional is a third element to indicate to fillblanks
 * <collectionname>_<year>-<month>-<day>_fillblanks.xlsx
 * example portfoliogate_2015-01-28.xlsx
 */
function _validateName(fileName){
	var _check={};
	
	logger.debug("[DEBUG] validateName(filename): "+fileName);
	var _parts=_.first(fileName.split('.')).split('_');
	//if (_parts[0]!="portfoliogate") return false;
	
	var _date = new Date(_parts[1]);
	if ( Object.prototype.toString.call(_date) !== "[object Date]" ) _date = null;

	var _boarddate = new Date(_parts[2]);
	if ( Object.prototype.toString.call(_boarddate) !== "[object Date]" ) _boarddate = null;
	
	_check.collection=_parts[0];
	if (_parts.indexOf("fillblanks")>=0){
		_check.fillblanks=true;
	}
	else {
		_check.fillblanks=false;
	}
		
	if (_date) _check.date= _parts[1];
	if (_boarddate) _check.boarddate = _boarddate;
	
	return _check;
}


/** 
 * pre-process portfolio gate data
 * takes a json object and does some processing before it gets stored
 */
function _handlePortfolioGate(json,date,boardDate,fillblanks,callback){
	var v1Service = require('../services/V1Service');

	v1Service.findEpics(function(_epics){
		logger.debug("*************** epics.length: "+_epics.length);
		//group by Date
		logger.debug("######################## _handlePortfolioGate called with date: "+date);
		var map = _clusterBy(json,"pDate",date,"pItems");
		var map2 = new Object();
			
		for(i =0 ; i < map.pItems.length; i++){
			var key = map.pItems[i].Status;
			if(!map2[key]){
			   var array = new Array();        
				map2[key] = array;
			}
			var _ref = map.pItems[i].EpicRef;
			var _e = _.find(_epics, { 'Number': _ref });
			
			//enrich with health attribute snapshot from current V1Epics 
			if (_e != undefined){
				if (_e.Health != undefined){
					map.pItems[i]["Health"]=_e.Health;
				}
				if (_e.HealthComment != undefined){
					map.pItems[i]["HealthComment"]=_e.HealthComment;
				}
				
				if (_e.PlannedStart != undefined){
					map.pItems[i]["PlannedStart"]=_e.PlannedStart;
				}
				if (_e.PlannedEnd != undefined){
					map.pItems[i]["PlannedEnd"]=_e.PlannedEnd;
				}
				if (_e.LaunchDate != undefined){
					map.pItems[i]["LaunchDate"]=_e.LaunchDate;
				}
				if (_e.Swag != undefined){
					map.pItems[i]["Swag"]=_e.Swag;
				}
			 }
			map2[key].push(map.pItems[i]);
		}
		map.pItems=map2;
		map.pBoardDate = boardDate;
				
		callback(map);
		return;
	});
}

/**
 * pre-process HR data
 */
function _handleOrganizationHistory(json,date,boardDate,fillblanks,callback){
	//group by Date
	logger.debug("######################## _handleOrganizationHistory called with date: "+date);
	var map = _clusterBy(json,"oDate",date,"oItems");

	logger.debug("++++++++++++++++++++++++++++++++ length of json: "+json.length);
	callback(map);
	return;
}

/**
 * pre-process HR data
 */
function _handleOrganization(json,date,boardDate,fillblanks,callback){
	//group by Date
	logger.debug("######################## _handleOrganization called with date: "+date);
	

	logger.debug("++++++++++++++++++++++++++++++++ length of json: "+json.length);
	callback(json);
	return;
}



/** 
 * generic pre-process data 
 * takes a json object and does some processing before it gets stored
 */
function _handlePlain(json,date,boardDate,fillblanks,callback){
	logger.debug("######################## _handlePlain called with date: "+date);
	if (fillblanks){
		var _rows = json.length;
		for (var row=0; row<_rows; row++){
			//logger.debug(orgData[i]);
			var _column=1;
			var _keys = Object.keys(json[row]);
			// !!!!!!!!!!!!! NEEDS some REFACTORING as it always fills up blanks now !!!!
			// also when i do NOT want it ;-)
			for (var key in json[row]){
				if (json[row-1]){
					var _x1_prev = json[row-1][_keys[_column]];
					var _x1 = json[row][_keys[_column]];if (!_x1 && _x1_prev) {
						json[row][_keys[_column]] = _x1_prev;
					} 
				}
			_column++;
			}
			
		}
	}
	callback(json);
	return;
}


/**
 * notifies when a portfolioupdate was imported
 */ 
function _sendPortfolioUpdate(to){
	var mailer = require('../services/MailService');

	//var _url = baseUrl+"/portfolio";
	var _url = "http://space.bwinparty.corp/portfolio";
	
	var mail = {};
	mail.to=to;
	mail.subject="[portfolio gate] update notification";
	mail.text="hej,\nthere is an updated portfolio gate view available under \n\n"+_url+" \n\ncheerz.";
	//mail.html="<html><body><h1>this is the html version</h1><p>and some text</p></body></html>";

	//testmail on startup
	mailer.sendText(mail);
}

/**
 * helper to cluster an array by a certain field
 */
function _clusterBy(inArray,clusterName,clusterValue,itemBucket){
	var map = new Object();
	for(i =0 ; i < inArray.length; i++){
		
		var key = clusterValue;
		//logger.debug("key:"+key);
		if (!map[clusterName]) map[clusterName]=key;
		if(map[clusterName]==key){
		   //logger.debug("****"+key);
			if (!map[itemBucket]) map[itemBucket] = new Array();
		}
		map[itemBucket][i]=(inArray[i]);
		//logger.debug("****"+json[i]);
	}
	return map;
}

