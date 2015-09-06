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


describe('IncidentTrackerService', function(){

describe('#calculate DailyTracker()', function(){
	it('should calculate daily tracker with a given incident list', function(done){

		var incidentTrackerService = require('../services/IncidentTrackerService');
		var _list =[];
		var _inc1 = {
	    "description" : "this is a test incident",
	    "id" : "INC100001",
			"priority" : "P01 - Critical",
	    "openedAt" : new Date("2015-05-02 15:03:00"),
	    "resolvedAt" : new Date("2015-05-02 15:13:00"),
			"closedAt" : new Date("2015-05-02 15:17:00"),
			"assignmentGroup" : "EnterpriseTools",
			"businessService" : "Business Service A",
			"label" : "label1.com,label2.us"
		};
		var _inc2 = {
	    "description" : "this is a test incident",
	    "id" : "INC100002",
			"priority" : "P01 - Critical",
	    "openedAt" : new Date("2015-05-02 12:03:00"),
	    "resolvedAt" : new Date("2015-05-02 15:13:00"),
			"closedAt" : new Date("2015-05-02 15:17:00"),
			"assignmentGroup" : "LeanOps",
			"businessService" : "Business Service A",
			"label" : "label2.us, label3.it"
		};

		var _inc3 = {
	    "description" : "this is a test incident",
	    "id" : "INC100003",
			"priority" : "P08 - High",
	    "openedAt" : new Date("2015-05-08 12:03:00"),
	    "resolvedAt" : new Date("2015-05-08 15:13:00"),
			"closedAt" : new Date("2015-05-08 15:17:00"),
			"assignmentGroup" : "Others",
			"businessService" : "BusinessService_C",
			"label" : "label5.es"

		};
	var _inc4 = {
		"description" : "this is a test incident",
		"id" : "INC100004",
		"priority" : "P01 - Critical",
		"openedAt" : new Date("2015-05-08 11:03:00"),
		"assignmentGroup" : "Others",
		"businessService" : "BusinessService_C",
		"label" : "label5.es"

	};

	var _inc5 = {
		"description" : "this is a test incident",
		"id" : "INC100005",
		"priority" : "P01 - Critical",
		"openedAt" : new Date("2015-05-07 17:03:00"),
		"assignmentGroup" : "Others",
		"businessService" : "BusinessService_C",
		"label" : "label5.es"
	};

	var _inc4change = {
		"description" : "this is a test incident",
		"id" : "INC100004",
		"priority" : "P08 - High",
		"openedAt" : new Date("2015-05-08 11:03:00"),
		"assignmentGroup" : "Others",
		"businessService" : "BusinessService_C",
		"label" : "label5.es",
		"prioChange" : {old:"P01",new:"P08"}
	};


		_list.push(_inc1);
		_list.push(_inc2);
		_list.push(_inc3);
		_list.push(_inc4);
		_list.push(_inc5);
		_list.push(_inc4change);

		//_calculateDailyTracker(incidents,dateField,context,callback)
		var _context="bpty.studios";
		var prios =["P01","P08","P16","P120"];
		incidentTrackerService.calculateDailyTracker(_list,["openedAt","resolvedAt","closedAt"],prios,_context,function(err,success){
			//logger.debug(success);
			logger.debug(JSON.stringify(success));
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.total);
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-08")})["openedAt"].P08.total);
			assert.equal(0, _.findWhere(success,{date:new Date("2015-05-08")})["openedAt"].P01.total);
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.businessService["Business Service A"]);
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.label["label2_us"]);
			//done();


			incidentTrackerService.buildStatistics(success,["P01"],function(err,result){
					assert.equal(2, _.findWhere(result.tracker,{date:new Date("2015-05-08")})["openedAt"].P01.cumulative);
					assert.equal(2, _.findWhere(result.tracker,{date:new Date("2015-05-08")})["closedAt"].P01.cumulative);
					assert.equal(3, result.statistics.sum.P01.openedAt);
					done();

					/*
					incidentTrackerService.findTrackerByDate("week","Q2-2015",function(err,data){
						logger.debug("--------------------------------------- data: "+JSON.stringify(data));
						done();
					});
					*/



			})
		})
	});
});



describe('#increment DailyTracker()', function(){
	it('should increment daily tracker with a given incident', function(done){

		var _inc1 = {
	    "description" : "this is a test incident",
	    "id" : "INC100001",
			"priority" : "P01 - Critical",
	    "openedAt" : new Date("2015-06-02 07:03:00"),
	    "resolvedAt" : new Date("2015-06-02 07:13:00"),
			"closedAt" : new Date("2015-06-02 07:17:00"),
			"assignmentGroup" : "EnterpriseTools",
			"businessService" : "Business Service A",
			"label" : "label1, label2"
		};
		var _inc2 = {
	    "description" : "this is a test incident",
	    "id" : "INC100002",
			"priority" : "P01 - Critical",
	    "openedAt" : new Date("2015-06-02 08:03:00"),
	    "resolvedAt" : new Date("2015-06-02 08:13:00"),
			"closedAt" : new Date("2015-06-02 08:17:00"),
			"assignmentGroup" : "LeanOps",
			"businessService" : "Business Service A",
			"label" : "label2, label3"
		};
		var _list=[];
		_list.push(_inc1);
		_list.push(_inc2);

		var prios = ["P01","P08","P16","P120"];
		var incidentTrackerService = require('../services/IncidentTrackerService');
		incidentTrackerService.incrementTracker(_list,["openedAt","resolvedAt","closedAt"],prios,function(err,result){
			logger.debug("incremented: "+JSON.stringify(result));
			done();

		});
	});
});


describe('#init DailyTracker()', function(){
	it('should initialize a daily tracker for a given date', function(done){
		var incidentTrackerService = require('../services/IncidentTrackerService');
		var prios =["P01","P08","P16","P120"];
		var _tracker = incidentTrackerService.initDailyTrackerForDay(new Date("2015-06-03"),["openedAt","closedAt","resolvedAt"],prios);
		logger.debug("tracker: "+JSON.stringify(_tracker));
		assert.equal(0,_tracker.openedAt.P01.total);
		done();

		});
	});


describe('#calc DailyTracker() on the fly', function(){
	it('should initialize a daily tracker for a given date', function(done){
		var incidentService = require('../services/IncidentService');
			this.timeout(30000);

		var incidentTrackerService = require('../services/IncidentTrackerService');
		var prios =["P08"];
		var _context="btpy.studios";
		incidentService.find({priority:"P08 - High"},function(err,incidents){
			logger.debug("number of incidents: "+incidents.length);
			incidentTrackerService.calculateDailyTracker(incidents,["openedAt","resolvedAt","closedAt"],prios,_context,function(err,tracker){
				logger.debug("tracker: "+JSON.stringify(tracker));
				//assert.equal(0,_tracker.openedAt.P01.total);
				done();

			});
	});

		})
	});

})
