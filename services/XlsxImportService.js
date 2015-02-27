var config = require('config');
var xlsx_json = require('xlsx-to-json');

var fs = require('fs');
var path = require('path');

var mongo = require('mongodb');
var mongojs = require('mongojs');

var _ = require('lodash');


var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize:true, prettyPrint:true,showLevel:true,timestamp:true}),
      new (winston.transports.File)({ filename: 'logs/s2t_xlsximport.log' , prettyPrint:true,showLevel:true})
    ]
  });
logger.level='debug';

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
	
	//var _outputFile =  __dirname + '/temp_uploads/'+_jsonfilename;
	var _outputFile =  _base +_jsonfilename;
	var _inputFile = _base+filename;

	console.log("******************** output: "+_outputFile);
	//1) convert xlsx2json
	
	xlsx_json({
		input: _inputFile ,
		output: _outputFile
	}, function(err, json) {
		if(err) {
			logger.error(err);
		}
		else{
			//console.log("parsed "+_jsonfilename+": "+json);
			logger.info("***and inserting into mongoDB...");
			logger.info("***************** [DEBUG]: _originalFilename: "+_originalFilename);
			// check is an object with 4 fields; {data,date,boardDate,fillblanks}
			var _check = _validateName(_originalFilename);
			var _collection = _check.collection;
			var _date = _check.date;
			var _boarddate = _check.boarddate;
			var _fillblanks = _check.fillblanks;
			
			var _function ="";
			var _dropBeforeInsert=false;
			
			var _plainElements =["productportfolio","productcatalog","targets","incidents","labels","customers","competitors"];
			
			if (_collection=="portfoliogate") _function = _handlePortfolioGate;
			else if (_collection=="organization") _function = _handleHR_PI;
			else if (_.indexOf(_plainElements,_collection) >-1){
				 _function = _handlePlain;
				 _dropBeforeInsert = true;
			}
			
			logger.info("***************** [DEBUG]: _collection: "+_collection+" _date: "+_date);
			
			// async processing pattern required here too ;-)
			if (_date){
				//var _data = _function(json,_date,_boarddate,_fillblanks);
				_function(json,_date,_boarddate,_fillblanks,function(_data){
				
					//console.log("...going to store to mongoDB: collection = "+_collection+" data:"+_data.oDate+" number of records: "+_data.oItems.length );
					
					var DB="kanbanv2";
					var connection_string = '127.0.0.1:27017/'+DB;
					var db = mongojs(connection_string, [DB]);
					
					// in some cases it would be needed to drop old collection first
					if (_dropBeforeInsert) db.collection(_collection).drop();
					
					var result = db.collection(_collection).insert(_data);
					
					console.log("****** result: "+JSON.stringify(result));
					
					done=true;
					
					if (_collection=="portfoliogate"){
						_sendPortfolioUpdate(config.notifications.portfolioupdate);
					}
					console.log("...stored ");
					
					
					// and delete the temp file stuff
					fs.unlink(_inputFile,function(err,succes){
						fs.unlink(_outputFile);
					});
					
					
					
					//return;
				});
			}
			
			else{
				console.log("NONO - wrong file and name!!!");
				done = false;
			}
		}
	});
}

		
/**
 * checks format for portfoliogate xlsx upload
 * must be: <collectionname>_<year>-<month>-<day>.xlsx
 * optional is a third element to indicate to fillblanks
 * <collectionname>_<year>-<month>-<day>_fillblanks.xlsx
 * example portfoliogate_2015-01-28.xlsx
 */
function _validateName(fileName){
	
	var _check={};
	
	console.log("[DEBUG] validateName(filename): "+fileName);
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
		
		console.log("*************** epics.length: "+_epics.length);
		
		//group by Date
		console.log("######################## _handlePortfolioGate called with date: "+date);
		
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
function _handleHR_PI(json,date,boardDate,fillblanks,callback){
	//group by Date
	console.log("######################## _handleHR_PI called with date: "+date);
	
	var map = _clusterBy(json,"oDate",date,"oItems");
			
	callback(map);
	return;
			
}



/** 
 * generic pre-process data 
 * takes a json object and does some processing before it gets stored
 */
function _handlePlain(json,date,boardDate,fillblanks,callback){
	//group by Date
	console.log("######################## _handlePlain called with date: "+date);
	
	// and fill blank cells 
	// _length = number of rows
	
	
	if (fillblanks){
	
		var _rows = json.length;
		for (var row=0; row<_rows; row++){
			//console.log(orgData[i]);
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
	var _url = "http://strategy2tactics.ea.bwinparty.corp/portfolio";
	
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
		//console.log("key:"+key);
		if (!map[clusterName]) map[clusterName]=key;
		if(map[clusterName]==key){
		   //console.log("****"+key);
			if (!map[itemBucket]) map[itemBucket] = new Array();
		}
		map[itemBucket][i]=(inArray[i]);
		//console.log("****"+json[i]);
	}
	return map;
	
}

