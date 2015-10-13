var spaceServices = require('space.services');
var organizationService = spaceServices.OrganizationService;

var async = require('async');

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.syncEmployeeImages = _syncEmployeeImages;

/**
 * http://my.bwinparty.com/api/people/images/e1000
 */
function _syncEmployeeImages(filter,callback) {
	var fs = require('graceful-fs');
  var request = require('request');

	logger.debug("***** sync....");

		organizationService.findEmployeesByFilter(filter, function (err, employees){
			if (employees){

				async.eachSeries(employees,
			    function(_employee, done){
			        console.log('processing: '+_employee["Employee Number"]);
			        //simulate some async process like a db CRUD or http call...

							logger.debug("E: "+_employee["First Name"]+" "+_employee["Last Name"]);
							var _id = _employee["Employee Number"];
							var _imageURL = "http://my.bwinparty.com/api/people/images/"+_id;
							// [TODO]
							// 1) detect type (PngService.detectType)
							// 2) convert everything to png which is not png
							// 3) squarifyandcirclecrop

							//Lets define a write stream for our destination file
							var _destinationFile = './temp/imagesync/'+_id;
							var destination = fs.createWriteStream(_destinationFile);
							//Lets save the modulus logo now
							request(_imageURL)
								.pipe(destination)
								.on('error', function(error){
								    console.log(error);
								})
								.on('finish',function(err,result){
									console.log("OK done - fetching image from: "+_imageURL+" -- storing to: "+_destinationFile);
									done();
								})

							/*
							download(_imageURL, _id+'.png', function(){
							  console.log('done: '+_id);
							});
							*/



			    },
			    function(err){
			        if(err){
			            console.log('Got an error')
			        }else{
			            console.log('All tasks are done now...');
			        }
			    });








/*


				for (var employee in docs){
					logger.debug(employee+" :  E: "+docs[employee]["First Name"]+" "+docs[employee]["Last Name"]);
					var _id = docs[employee]["Employee Number"];
					var _imageURL = "http://my.bwinparty.com/api/people/images/";
					// [TODO]
					// 1) detect type (PngService.detectType)
					// 2) convert everything to png which is not png
					// 3) squarifyandcirclecrop

					//Lets define a write stream for our destination file
					var destination = fs.createWriteStream('../temp/'+_id);
					//Lets save the modulus logo now
					request(_imageURL+_id)
					.pipe(destination)
					.on('error', function(error){
					    console.log(error);
					});

					/*
					download(_imageURL, _id+'.png', function(){
					  console.log('done: '+_id);
					});
					*/
				}
	//			callback(null,"done");
	//		}


		});
	}
