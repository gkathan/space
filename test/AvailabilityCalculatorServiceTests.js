var winston = require('winston');
var config = require('config');

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


describe('AvailabilityCalculatorService', function(){
  describe('#getStuff()', function(){
    it('test test', function(){

      var avCalculatorService = require('../services/AvailabilityCalculatorService');
			console.log("---------------------");
			avCalculatorService.getStuff("ubba",function(xxx){
				console.log("xxxxxx");
				var av ="xx";
				assert.equal("y", av);

				//var unplanned = JSON.parse(data[0].avReport.getYTDDatapoint);
				


			})


			//assert.equal("E2988", employee.EmployeeNumbexr);

		});



    })

})
