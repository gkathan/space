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

})
