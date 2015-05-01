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
    it('test test', function(done){
      var avCalculatorService = require('../services/AvailabilityCalculatorService');
			console.log("---------------------");
			avCalculatorService.getStuff("ubba",function(xxx){
				console.log("xxxxxx");
				var av ="xx";
				assert.equal("xx", av);
				done();
			})
		});
  })
})
