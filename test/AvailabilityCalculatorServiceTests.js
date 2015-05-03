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
  describe('#calculateOverall(from,to)', function(){
    it('calculates overall AV values', function(done){
      var avCalculatorService = require('../services/AvailabilityCalculatorService');
			console.log("---------------------");
			avCalculatorService.calculateOverall("2015-01-01","2015-01-31",function(data){
				console.log("data: "+data);
				//var av ="xx";
				//assert.equal("xx", av);
				done();
			})
		});
  })
})
