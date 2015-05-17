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


describe('IncidentService', function(){
  describe('#_mapPriority()', function(){
    it('maps snow code to bpty meaninful descripion', function(done){

      var incidentService = require('../services/IncidentService');

			var _bptyCode = incidentService.mapPriority(1);
			assert.equal("P01 - Critical", _bptyCode);

			var _bptyCode = incidentService.mapPriority(2);
			assert.equal("P08 - High", _bptyCode);

			var _bptyCode = incidentService.mapPriority(3);
			assert.equal("P16 - Moderate", _bptyCode);

			var _bptyCode = incidentService.mapPriority(4);
			assert.equal("P40 - Low", _bptyCode);

			done();
		});
	});

  describe('#_mapState()', function(){
    it('maps snow code to bpty meaninful descripion', function(done){

      var incidentService = require('../services/IncidentService');

			var _bptyCode = incidentService.mapState(1);
			assert.equal("New", _bptyCode);

			var _bptyCode = incidentService.mapState(2);
			assert.equal("In Progress", _bptyCode);

			var _bptyCode = incidentService.mapState(3);
			assert.equal("Closed", _bptyCode);

			var _bptyCode = incidentService.mapState(8);
			assert.equal("Awaiting", _bptyCode);

			var _bptyCode = incidentService.mapState(9);
			assert.equal("Resolved", _bptyCode);

			done();
		});
  });

  describe('#getOverdueGroupedBy()', function(){
    it('returns grouped by incdients', function(done){
      var incidentService = require('../services/IncidentService');
			incidentService.getOverdueGroupedByAssignmentGroup(function(result){
					logger.debug("result: "+result.children.length);
					done();
			})
		});
  });

  describe('#findSOC()', function(){
    it('returns ALL incdients from SOC', function(done){
      var incidentService = require('../services/IncidentService');
			incidentService.findSOC(function(err,result){
					if (err) logger.error("error: "+err);
					//logger.debug("result: "+result.length);
					done();
			})

		});
  });


  describe('#findAll()', function(){
    it('returns ALL incdients from both oldsnow and newsnow', function(done){
      this.timeout(10000);
			var incidentService = require('../services/IncidentService');
			incidentService.findAll(function(err,result){
					if (err) logger.error("error: "+err);
					logger.debug("result: "+result.length);

					done();
			})

		});
  });


	describe('#findrevenueImpactMapping()', function(){
    it('returns ALL incdients2revenue impact', function(done){

      var incidentService = require('../services/IncidentService');
			incidentService.findRevenueImpactMapping(function(err,result){
					var _sum = 0;
					for (var i in result){
						_sum+=parseInt(result[i].impact);
					}
					logger.debug("result: "+result.length);
					logger.debug("impact sum: "+_sum);

					done();
			})

		});
  });



})
