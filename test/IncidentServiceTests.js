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



/*
  describe('#findAll()', function(){
    it('returns ALL incdients from both oldsnow and newsnow', function(done){
      this.timeout(10000);
			var incidentService = require('../services/IncidentService');
			incidentService.findAll({},function(err,result){
					if (err) logger.error("error: "+err);
					logger.debug("result: "+result.length);

					done();
			})

		});
  });
*/

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
/*
	describe('#findOld()', function(){
    it('returns incidents from old snow', function(done){
			this.timeout(10000);
      var incidentService = require('../services/IncidentService');
			incidentService.findOld({active:"TRUE"},function(err,result){
					logger.debug("result: "+result.length);

					done();
			})
		});
  });


//=> WILL FLUSH AND REBUILD THE TRACKERS!!!

/*
	describe('#rebuild DailyTracker()', function(){
    it('should create a daily tracker statistic for a given list of incidents', function(done){
			this.timeout(30000);
      var incidentService = require('../services/IncidentService');
			incidentService.rebuildTracker("openedAt",function(err,result){
				logger.debug(result);
				done();
			})
		});
  });

	describe('#rebuild DailyTracker()', function(){
    it('should create a daily tracker statistic for a given list of incidents', function(done){
			this.timeout(30000);
      var incidentService = require('../services/IncidentService');
			incidentService.rebuildTracker("closedAt",function(err,result){
				logger.debug(result);
				done();
			})
		});
  });

	describe('#rebuild DailyTracker()', function(){
    it('should create a daily tracker statistic for a given list of incidents', function(done){
			this.timeout(30000);
      var incidentService = require('../services/IncidentService');
			incidentService.rebuildTracker("resolvedAt",function(err,result){
				logger.debug(result);
				done();
			})
		});
  });
*/




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

		_list.push(_inc1);
		_list.push(_inc2);
		_list.push(_inc3);

		//_calculateDailyTracker(incidents,dateField,context,callback)
		var _context="bpty.studios";
		incidentTrackerService.calculateDailyTracker(_list,["openedAt","resolvedAt","closedAt"],_context,function(err,success){
			//logger.debug(success);
			logger.debug(JSON.stringify(success));
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.total);
			assert.equal(1, _.findWhere(success,{date:new Date("2015-05-08")})["openedAt"].P08.total);
			assert.equal(0, _.findWhere(success,{date:new Date("2015-05-08")})["openedAt"].P01.total);
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.businessService["Business Service A"]);
			assert.equal(2, _.findWhere(success,{date:new Date("2015-05-02")})["openedAt"].P01.label["label2_us"]);

			done();
		})
	});
});


describe('#rebuild cumulative DailyTracker()', function(){
	it('should rebuild cumulative daily tracker with a given incident', function(done){
			this.timeout(30000);

		var incidentTrackerService = require('../services/IncidentTrackerService');
		incidentTrackerService.rebuildCumulativeTrackerData(function(err,result){
			logger.debug("rebuild cumulative: "+JSON.stringify(result));
			done();

		});
	})
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

		var incidentTrackerService = require('../services/IncidentTrackerService');
		incidentTrackerService.incrementTracker(_list,function(err,result){
			logger.debug("incremented: "+JSON.stringify(result));
			done();

		});
	});
});


describe('#init DailyTracker()', function(){
	it('should initialize a daily tracker for a given date', function(done){
		var incidentTrackerService = require('../services/IncidentTrackerService');
		var _tracker = incidentTrackerService.initDailyTrackerForDay(new Date("2015-06-03"),["openedAt","closedAt","resolvedAt"]);
		logger.debug("tracker: "+JSON.stringify(_tracker));
		assert.equal(0,_tracker.openedAt.P01.total);
		done();

		});
	});



})
