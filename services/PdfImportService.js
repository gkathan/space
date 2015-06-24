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




var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize:true, prettyPrint:true,showLevel:true,timestamp:true}),
      new (winston.transports.File)({ filename: 'logs/pdfimport.log' , prettyPrint:true,showLevel:true})
    ]
  });
logger.level='debug';

var appRoot = require('app-root-path');

/**
 *
 *store pdf
 */
exports.store = function (filename,collection) {
	// here we can do our processing
	var _originalFilename = filename;
	console.log(" originalFilename: "+_originalFilename);

	var _check = _validateName(_originalFilename);

	var _t = '/files/'+collection+'/';
	var _base = appRoot+ '/temp/';
	var _target = appRoot+ '/public'+_t ;

	//var _outputFile =  __dirname + '/temp_uploads/'+_jsonfilename;
	var _outputFile =  _base;
	var _inputFile = _base+filename;
	var _targetFile = _target+filename;
	var _path = _t+filename;

	// and store it in DB
	var _data = {};
	_data.type=_check.type;
	_data.count = _check.count;
	_data.year = _check.year;
	_data.contact = config.itservicereports.contact;
	_data.contactEmail = config.itservicereports.contactEmail;
	_data.path = _path;

	var result = db.collection(_check.collection).insert(_data,function(err,success){
		console.log(" _outputFile: "+_outputFile);
		console.log(" _inputFile: "+_inputFile);
		console.log(" _targetFile: "+_targetFile);
		console.log("..and move to files/fireports folder..");

		fs.rename(_inputFile,_targetFile,function(err,success){
				console.log("...rename..");
		});

	});

}


/**
 * checks format for itservicereports upload
 * must be: itservicereports<year>-<type>-<number>.xlsx
 * example itservicereports-week-7.pdf
 * example itservicereports-month-1.pdf = would be the january report
 */
function _validateName(fileName){

	var _check={};

	console.log("[DEBUG] validateName(filename): "+fileName);
	var _p=_.first(fileName.split('.')).split('_');

	var _parts = _p[1].split("-");



	var _year = parseInt(_parts[0]);
	console.log("_year: "+_year);
	var _type = _parts[1];
	console.log("_type: "+_type);
	if (_type !="week" && _type!="month" && _type!="year") return false;
	var _count = parseInt(_parts[2]);
	console.log("_count: "+_count);

	_check.collection=_p[0];
	_check.year=_year;
	_check.type=_type;
	_check.count=_count;


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
