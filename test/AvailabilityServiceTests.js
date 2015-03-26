var winston = require('winston');





winston.loggers.add('test_log',{
	console:{
		colorize:true,
		prettyPrint:true,
		showLevel:true,
		timestamp:true,
		level:"debug"
	},
    file:{
		filename: 'logs/test.log' ,
		prettyPrint:true,
		showLevel:true,
		level:"debug"
	}
});

var logger = winston.loggers.get('test_log');
var assert = require("assert")


describe('AvailabilityService', function(){
  describe('#sync()', function(){
    it('should read data from REST endpoint from avreport and store it in DB', function(){

      var avSyncService = require('../services/AvailabilitySyncService');
			var urls = ["http://avreport.bwin.intranet/API/AvReoprtingService.svc/getYTDDatapoint","http://avreport.bwin.intranet/API/AvReoprtingService.svc/GetAVGraphDatapoints"];

			avSyncService.sync(urls,function(){
				var avService=require('../services/AvailabilityService');
				avService.getLatest(function(data){
					//var av = avReport.getYTDDatapoint;
				var av ="xx";
				assert.equal("y", av);
	
					var unplanned = JSON.parse(data[0].avReport.getYTDDatapoint);

				})



			});

			//assert.equal("E2988", employee.EmployeeNumbexr);

		});



    })

})
