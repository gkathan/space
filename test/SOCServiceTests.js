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


describe('SOCServices', function(){
  describe('outages', function(){
    it('bla', function(done){

      var socService = require('../services/SOCService');

			socService.findOutages(null,function(err,results){
					logger.debug("Outages : "+results.length);
					done();
			})


		});
	});

  describe('label2customer mapping', function(){
    it('bla', function(done){

      var socService = require('../services/SOCService');

			socService.findLabel2Customer(null,function(err,results){
					logger.debug("_findLabel2Customer : "+results.length);
					done();
			})


		});
	});






  describe('#findServicesMain()', function(){
    it('should read SOC Main Services data from MongoDB', function(done){
      var socService = require('../services/SOCService');
			socService.findServicesMain(function(err,data){
				console.log("----------- data: "+data);
				var _length = data.length;
				assert.equal(15, _length);
				done();
				})
			});
  	});

  describe('#findServicesExternal()', function(){
    it('should read SOC External Services data from MongoDB', function(done){
      var socService = require('../services/SOCService');
			socService.findServicesExternal(function(err,data){
				console.log("----------- data: "+data);
				var _length = data.length;
				assert.equal(7, _length);

				done();
				})
			});
  	});
  describe('#findSOCOutages()', function(){
    it('should read SOCOutages data from MongoDB', function(done){
      var socService = require('../services/SOCService');

			//var _filter={start:{$gte:new Date('2015-04-01'),$lte:new Date('2015-04-30')}};
			var _filter={start:{$gte:new Date('2015-05-01'),$lte:new Date('2015-05-31')}};

			socService.findOutages(_filter,function(err,data){
				if(err){
					logger.error("err: "+err.message);

				}
				console.log("----------- data: "+data.length);
				var _rev=0;
				//make sure we do not double count
				var revenueImpactDoubleTracker={};

				for (var i in data){
					logger.debug("inc: "+data[i].incidentID+" revenueImpact: "+data[i].revenueImpact);
					var _id = data[i].incidentID;
					if (data[i].revenueImpact &&!revenueImpactDoubleTracker[_id]){
						_rev+=parseInt(data[i].revenueImpact);
						logger.debug("**************** OK set tracker for: "+_id);
						revenueImpactDoubleTracker[_id]=true;
					}
				}
				logger.debug("items: "+data.length);
				logger.debug("plain sum revenue impact: "+_rev);

				done();
				})
			});
  	});

})
