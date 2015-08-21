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
var _ = require("lodash");



describe('V1Service', function(){
  describe('#getEpics()', function(){
    it('should get all epics in DB', function(done){
      var v1Service = require('../services/V1Service');
			v1Service.findEpics(function(err,epics){
					console.log("--- epics: "+epics.length);

					done();
			})
			//assert.equal("E2988", employee.EmployeeNumbexr);
		});
  })


  describe('#getInitiativeEpics()', function(){
    it('should get all epics type == Initiative in DB', function(done){
      var v1Service = require('../services/V1Service');
			v1Service.findInitiativeEpics(function(err,epics){
					console.log("--- epics type == Initiative: "+epics.length);

					done();
			})
			//assert.equal("E2988", employee.EmployeeNumbexr);
		});
	});


  describe('#getPortfolioApprovalEpics()', function(){
    it('should get all epics which have set PortfolioApproval="YES" in DB', function(done){
      var v1Service = require('../services/V1Service');
			v1Service.findPortfolioApprovalEpics(function(err,epics){
					console.log("--- epics PortfolioApproval: "+epics.length);

					done();
			})
			//assert.equal("E2988", employee.EmployeeNumbexr);
		});
	});


describe('#getRoadmap()', function(){
	it('should get all epics which should appear in a roadmap ', function(done){
		var v1Service = require('../services/V1Service');
		
		v1Service.getRoadmapInitiatives(new Date("2015-01-01"),function(err,roadmap){
				console.log("--- roadmap: "+roadmap.length);

				done();
		})
		//assert.equal("E2988", employee.EmployeeNumbexr);
	});
});


})
