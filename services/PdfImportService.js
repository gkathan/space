var config = require('config');

var fs = require('fs');
var path = require('path');

var mongo = require('mongodb');
var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);
var moment = require('moment');


var winston=require('winston');
var logger = winston.loggers.get('space_log');

var appRoot = require('app-root-path');

/**
 *
 *store pdf
 */
exports.store = function (filename,collection,callback) {
	// here we can do our processing
	var _originalFilename = filename;
	console.log(" originalFilename: "+_originalFilename);

	var _check = _validateName(_originalFilename);

  if (_check==false) callback(null,"[PDFImporter] says: not a valid filename man !");

	var _t = '/files/'+collection+'/';
	var _base = appRoot+ '/temp/';
	var _target = appRoot+ '/public'+_t ;

	//var _outputFile =  __dirname + '/temp_uploads/'+_jsonfilename;
	var _outputFile =  _base;
	var _inputFile = _base+filename;

  var _parts=filename.split(".");
  var _filenameWithYear = _parts[0]+" - "+_check.year+"."+_parts[1];
	var _targetFile = _target+_filenameWithYear;

	var _path = _t+_filenameWithYear;

	// and store it in DB
	var _data = {};
	_data.type=_check.type;
	_data.count = _check.count;
	_data.year = _check.year;
  _data.month= _check.month;
	_data.contact = config.itservicereports.contact;
	_data.contactEmail = config.itservicereports.contactEmail;
	_data.path = _path;

  logger.debug("------------------- month: "+_data.month+" year: "+_data.year+" count: "+_data.count);
  db.collection(_check.collection).findOne({month:_data.month,year:_data.year,count:_data.count},function(err,result){

    logger.debug("------------------- result = "+result);

    if (result){
      _data._id=result._id;
      logger.debug("++++++++++++++ OK found existing report with id: "+_data._id);
    }
    var result = db.collection(_check.collection).save(_data,function(err,success){
  		console.log(" _outputFile: "+_outputFile);
  		console.log(" _inputFile: "+_inputFile);
  		console.log(" _targetFile: "+_targetFile);
  		console.log("..and move to files/fireports folder..");

  		fs.rename(_inputFile,_targetFile,function(err,success){
  				console.log("...rename..");
          callback(null,"OK")
      });
  	});


  })


}


/**
 * checks format for itservicereports upload
 * must be: "Studios IT Service Report <Month> - Week<number>.pdf
 * example Studios IT Service Report July - Week1.pdf
 *
 */
function _validateName(fileName){
	var _check={};
	console.log("[DEBUG] validateName(filename): "+fileName);
	var _parts = fileName.split(" - ");
  if (!_parts[1]) return false;

  if (_parts[1].split(".")[1] !="pdf") return false;
  var _month = _.last(_parts[0].split(" "));
  var _year = moment().year();
  var _count = _parts[1].split(".")[0].split("Week")[1];

	_check.collection="itservicereport";
	_check.year=_year;
  _check.month=_month;
	_check.type="week";
	_check.count=parseInt(_count);

	return _check;
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
