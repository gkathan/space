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
  describe('#findSOCServicesMain()', function(){
    it('should read SOC Main Services data from MongoDB', function(done){
      var avService = require('../services/AvailabilityService');
			avService.findSOCServicesMain(function(data){
				console.log("----------- data: "+data);
				var _length = data.length;
				assert.equal(22, _length);

				done();
				})
			});
  	});

  describe('#findSOCServicesExternal()', function(){
    it('should read SOC External Services data from MongoDB', function(done){
      var avService = require('../services/AvailabilityService');
			avService.findSOCServicesExternal(function(data){
				console.log("----------- data: "+data);
				var _length = data.length;
				assert.equal(7, _length);

				done();
				})
			});
  	});

})
