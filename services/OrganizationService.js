/**
 * organization service
 */


var config = require('config');

var mongojs = require('mongojs');

var _ = require('lodash');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);



var winston=require('winston');
var logger = winston.loggers.get('space_log');



/**
 *
 */
exports.findEmployeeByFirstLastName = function (firstname,lastname, callback) {
	logger.debug("findEmployeeByFirstLastName first: "+firstname+", last: "+lastname);
	var organization =  db.collection('organization');
		organization.find({'First Name':firstname,'Last Name':lastname}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(docs);
			return;
	});
}

exports.findEmployeesByFunction = function (_function, callback) {
	logger.debug("findEmployeesByFunction _function: "+_function);
	var organization =  db.collection('organization');
		organization.find({'Function':_function}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(docs);
			return;
	});
}

exports.findEmployees = function (callback) {
	logger.debug("findEmployees: all");
	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){
			if (docs) logger.debug("[ok] found some shit ... : "+docs);
			callback(docs);
			return;
	});
}



/**
 * http://my.bwinparty.com/api/people/images/e1000
 */
exports.syncEmployeeImages = function (req,res,callback) {


	var fs = require('fs');
    var request = require('request');

	var download = function(uri, filename, callback){
		request.head(uri, function(err, res, body){
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);

			//request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};

	logger.debug("***** sync....");

	var organization =  db.collection('organization');
		organization.find({}).sort({$natural:1}, function (err, docs){

			if (docs){


				for (var employee in docs){
					logger.debug("* e: "+docs[employee]["First Name"]);
					var _id = docs[employee]["Employee Number"];
					var _imageURL = "http://my.bwinparty.com/api/people/images/";


					download(_imageURL, _id+'.png', function(){
					  console.log('done: '+_id);
					});
				}
			}

		});

	}









/**
 * organization snapsho dates
 * => should be moved in a service class ;-)
 */
exports.getOrganizationHistoryDates = function(callback){
   db.collection("organizationhistory").find({},{oDate:1}).sort({oDate:-1},function(err,data){
			logger.debug("OrganizationService.getOrganizationHistoryDates(): ");
			if (err) {
				logger.warn("error: "+err);
				callback(err);
			}

			else callback(data);
	});
}
