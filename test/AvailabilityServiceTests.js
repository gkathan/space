var winston = require('winston');
var moment = require('moment');




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
				assert.equal(15, _length);

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
  describe('#findSOCIncidents()', function(){
    it('should read SOCIncidents data from MongoDB', function(done){
      var avService = require('../services/AvailabilityService');

			//var _filter={start:{$gte:new Date('2015-04-01'),$lte:new Date('2015-04-30')}};
			var _filter={start:{$gte:new Date('2015-05-01'),$lte:new Date('2015-05-31')}};

			avService.findSOCIncidents(_filter,function(err,data){
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
  describe('#findIncidents()', function(){
    it('should read Incidents data from MongoDB', function(done){
      var incService = require('../services/IncidentService');

			//var _filter={start:{$gte:new Date('2015-04-01'),$lte:new Date('2015-04-30')}};
			var _filter={openedAt:{$gte:new Date('2015-05-01'),$lte:new Date('2015-05-30')},priority:"P01 - Critical"};
			//var _filter={priority:{$eq:"P01 - Critical"}};

			incService.findFiltered(_filter,function(err,data){
				if(err){
					logger.error("err: "+err.message);

				}
				console.log("----------- data: "+data.length);
				var _rev=0;
				//make sure we do not double count
				var revenueImpactDoubleTracker={};

				for (var i in data){
					logger.debug("inc: "+data[i].id+" openedAT: "+moment(data[i].openedAt).format("YYYY-MM-DD")+" revenueImpact: "+data[i].revenueImpact);
					var _id = data[i].id;
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
