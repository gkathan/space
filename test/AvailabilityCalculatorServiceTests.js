var winston = require('winston');
var config = require('config');
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

var avCalculatorService = require('../services/AvailabilityCalculatorService');

describe('AvailabilityCalculatorService', function(){

	describe('#calculateOverall(from,to)', function(){
    it('calculates overall AV values', function(done){

			console.log("---------------------");
			avCalculatorService.calculateOverall("2015-01-01","2015-04-02",null,function(data){
				console.log("data: "+JSON.stringify(data));
				//var av ="xx";
				//assert.equal("xx", av);
				done();
			});
		});
  })

  describe('#checkCoreTime(from,to)', function(){
    it('checks whetehr an incident is in core-time or not ', function(done){
		// weekday - 3 minutes spanning into coretime
			// weekdays / wednesday
			var _inc1 = {
				"degradation" : 100,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-05-06 15:58:00"),
		    "stop" : new Date("2015-05-06 16:03:00"),
		    "resolutionTime" : 9480000
			};
			console.log("---------------------");
			avCalculatorService.checkCoreTime(_inc1,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));

				// 180000ms = 3 minutes
				assert.equal(180000, result.coreTime);
				done();
			})
		});
	})

	describe('#checkCoreTime(from,to)', function(){
    it('checks whetehr an incident is in core-time or not ', function(done){
			// weekday
			// no coretime
			var _inc2 = {
				"degradation" : 100,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-05-06 14:58:00"),
		    "stop" : new Date("2015-05-06 15:44:00"),
		    "resolutionTime" : 9480000
			};
			avCalculatorService.checkCoreTime(_inc2,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));

				// 0 = 0 minutes
				assert.equal(0, result.coreTime);
				done();
			});
		});
	})

	describe('#checkCoreTime(from,to)', function(){
    it('checks whetehr an incident is in core-time or not ', function(done){
			// weekday
			// no coretime			// saturday
			// full inside 10 minutes = 600 000
			var _inc3 = {
				"degradation" : 100,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-05-02 15:03:00"),
		    "stop" : new Date("2015-05-02 15:13:00"),
		    "resolutionTime" : 9480000
			};
			avCalculatorService.checkCoreTime(_inc3,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));

				// 300000ms = 5 minutes
				assert.equal(600000, result.coreTime);
				done();
			});
		});
	})

	describe('#checkCoreTime(from,to)', function(){
		it('checks whetehr an incident is in core-time or not ', function(done){
				// sunday
				// spans 5 minutes ofer core time
				var _inc4 = {
					"degradation" : 100,
			    "description" : "this is a test incident",
			    "extService" : false,
			    "highlight" : false,
			    "incidentID" : "INC120861",
			    "isCoreService" : true,
			    "isEndUserDown" : true,
			    "isExt" : false,
			    "isIR" : false,
			    "isPlanned" : false,
			    "priority" : "P1",
			    "report" : true,
			    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
			    "serviceName" : "Sportsbook main",
			    "start" : new Date("2015-05-03 23:30:00"),
			    "stop" : new Date("2015-05-04 01:10:00"),
			    "resolutionTime" : 9480000
				};

				avCalculatorService.checkCoreTime(_inc4,function(result){
					console.log("data returned: "+JSON.stringify(result));
					console.log("coretime: "+formatDuration(result.coreTime));
					console.log("resolutionTime: "+formatDuration(result.resolutionTime));
					// 600000ms = 10 minutes + 1 second as we have 23:59:59 as split
					assert.equal(601000, result.coreTime);
					done();
				});
			})
		})


	describe('#checkCoreTime(from,to)', function(){
    it('checks whetehr an incident is in core-time or not: starts before coretime and spans into coretime by 2 hours and 13 minutes ', function(done){
			// weekday
			// 2 hours and 13 minutes = 133 minutes * 60 = 7980000
			//
			var _inc5 = {
				"degradation" : 100,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-04-30 15:03:00"),
		    "stop" : new Date("2015-04-30 18:13:00"),
		    "resolutionTime" : 9480000
			};
			avCalculatorService.checkCoreTime(_inc5,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));


				assert.equal(7980000, result.coreTime);
				done();
			});
		});
	})

	describe('#checkCoreTime(from,to)', function(){
    it('checks whetehr an incident is in core-time or not: starts before coretime and spans into coretime by 2 hours and 13 minutes ', function(done){
			// weekday
			// 2 hours and 13 minutes = 133 minutes * 60 = 7980000
			//
			var _inc6 = {
				"degradation" : 100,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-04-30 15:03:00"),
		    "stop" : new Date("2015-04-30 18:13:00"),
		    "resolutionTime" : 9480000
			};
			avCalculatorService.checkCoreTime(_inc6,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));


				assert.equal(7980000, result.coreTime);
				done();
			});
		});
	})

	describe('#checkCoreTime(from,to)', function(){
    it('the incident which crashes the calculation.... ', function(done){
			// weekday
			// 2 hours and 13 minutes = 133 minutes * 60 = 7980000
			//
			var _inc5 = {
				"degradation" : 5,
		    "description" : "this is a test incident",
		    "extService" : false,
		    "highlight" : false,
		    "incidentID" : "INC120861",
		    "isCoreService" : true,
		    "isEndUserDown" : true,
		    "isExt" : false,
		    "isIR" : false,
		    "isPlanned" : false,
		    "priority" : "P1",
		    "report" : true,
		    "rootCause" : "Further Investigation a and root cause analysis will be done in PRB002038",
		    "serviceName" : "Sportsbook main",
		    "start" : new Date("2015-01-12 12:30:00"),
		    "stop" : new Date("2015-01-12 15:12:00"),
		    "resolutionTime" : 9720000
			};
			avCalculatorService.checkCoreTime(_inc5,function(result){
				console.log("data returned: "+JSON.stringify(result));
				console.log("coretime: "+formatDuration(result.coreTime));
				console.log("resolutionTime: "+formatDuration(result.resolutionTime));


				assert.equal(0, result.coreTime);
				done();
			});
		});
	})

describe('#calculateOverallCoreTime(from,to)', function(){
	it('calculates the total time of core time for the given period.... ', function(done){
		var _from = new Date("2015-01-01");
		var _to = new Date("2015-01-02");

		// thursday
		// coretime is 16:00:00-23:59:59
		// = 28800000 ms
		// - 1 second
		// =
		var coreTotalTime = avCalculatorService.calculateTotalCoreTime(_from,_to);



		assert.equal(28799000, coreTotalTime);
		done();

	});
})

describe('#checkLabels(filterList,incidentist)', function(){
	it('bla... ', function(done){
		var _filter = ["bwin.com","bwin.it","bwin.fr","bwin.es","gamebookers.com"];
		var _emptyFilter =[];
		var _incident1 = ["bwin.com","party.com"];
		var _incident2 = [];
		var _incident3;
		var _incident4 = ["party.com"];



		var _check1 = avCalculatorService.checkLabels(_filter,_incident1);
		var _check2 = avCalculatorService.checkLabels(_filter,_incident2);
		var _check3 = avCalculatorService.checkLabels(_filter,_incident3);
		var _check4 = avCalculatorService.checkLabels(_filter,_incident4);
		var _check5 = avCalculatorService.checkLabels(_emptyFilter,_incident1);

		assert.equal(true, _check1);
		assert.equal(true, _check2);
		assert.equal(true, _check3);
		assert.equal(false, _check4);
		assert.equal(true, _check5);


		done();


	});
})

})




function formatDuration(time){
 	var d = moment.duration(time);
		if (d>=86400000) return d.format("d[d] h:mm:ss", { trim: false });
		return d.format("h:mm:ss", { trim: false });
}
