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


describe('#findEpicsWithChildren()', function(){
	it('should get all epics including children based on parent field ', function(done){
		var v1Service = require('../services/V1Service');
	this.timeout(30000);
	var _filter = {};
		v1Service.findEpicsWithChildren(_filter,function(err,epics){
				console.log("--- all epics with children: "+epics.length);

				var _e =_.findWhere(epics,{"Number":"E-10959"});
				console.log("E-10959: "+_e.Children);
				done();
		})
		//assert.equal("E2988", employee.EmployeeNumbexr);
	});
});

describe('#findInitiativesWithPlanningEpics()', function(){
	it('should get all initiatives including children planning epics ', function(done){
		var v1Service = require('../services/V1Service');
	this.timeout(30000);
	var _filter = {};
		v1Service.findInitiativesWithPlanningEpics(_filter,function(err,epics){
				for (var e in epics){
					var _e = epics[e];
					var _children = 0;
					if (_e.Children) _children = _e.Children.length;
					logger.debug("** epic: "+_e.Number+" category: "+_e.CategoryName+" planning epics children: "+_children);
					if (_e.Children){
						for (var c in _e.Children){
							var _c = _e.Children[c];
							logger.debug("****** epic: "+_c.Number+" category: "+_c.CategoryName);
						}
					}
				}
				console.log("--- all initiatives with planning epics: "+epics.length);

			//	var _e =_.findWhere(epics,{"Number":"E-10365"});
			//	console.log("E-10365.Children: "+_e.Children);
				done();
		})
		//assert.equal("E2988", employee.EmployeeNumbexr);
	});
});







describe('#getRoot()', function(){
	it('find real root of an epic ', function(done){
		var v1Service = require('../services/V1Service');
	this.timeout(30000);
		var _prefilter = {$and:[{$or:[{CategoryName:"Initiative"},{CategoryName:"Planning"},{CategoryName:"Product Contribution"}]}]};
		v1Service.findEpicsWithChildren(_prefilter,function(err,epics){
				console.log("--- all epics: "+epics.length);

				var _e =_.findWhere(epics,{"Number":"E-10959"});

				var _root = v1Service.getRoot(epics,"E-10959");

				//console.log("root: "+JSON.stringify(_root));
				console.log("children: "+_root.Children.length);

				for (var i in _root.Children){
					console.log("** "+_root.Children[i].Number+" - "+_root.Children[i].Name);
				}

				var _planningepics = v1Service.getPlanningEpics(_root);
				console.log("planning epics: "+_planningepics.length);
				done();
		})
		//assert.equal("E2988", employee.EmployeeNumbexr);
	});
});


describe('#getMembersPerPlanningBacklog()', function(){
	it('find members of team per backlog ', function(done){
		var v1Service = require('../services/V1Service');

	v1Service.findTeams({},function(err,teams){
		v1Service.findMembers({IsDisabled:false},function(err,members){

			var _members = v1Service.getMembersPerPlanningBacklog("[CAS-APP-DT] Casino Desktop #cpb",teams,members);

					console.log("members: "+_members.length);
					done();
			})
			//assert.equal("E2988", employee.EmployeeNumbexr);
		});
	});
});



describe('#getPlanningEpics()', function(){
	it('find Planning Epics an epic ', function(done){
		var v1Service = require('../services/V1Service');
		this.timeout(30000);
		v1Service.findInitiativesWithPlanningEpics({},function(err,epics){
		//v1Service.findEpicsWithChildren({},function(err,epics){
				console.log("--- all epics: "+epics.length);
				var _e =_.findWhere(epics,{"Number":"E-10618"});

				var _planningepics = v1Service.getPlanningEpics(_e);

				if (_e.Children) console.log("children: "+_e.Children.length);
				console.log("Category: "+_e.CategoryName);

				console.log("-----planning epics: "+_planningepics.length);
				for (var p in _planningepics){
					var _p = _planningepics[p];
					console.log("planning epic: "+_p.Number+" backlog: "+_p.BusinessBacklog);
					//console.log("planning epic: "+JSON.stringify(_p));
				}


				var _backlogs = v1Service.getBacklogsFromInitiativesWithPlanningEpics(epics);
				console.log("number of distinct backlogs: "+_backlogs.length)
				for (var b in _backlogs){
					var _b = _backlogs[b];
					console.log("** "+_b.Name+ " - "+_b.Initiatives.length+ " initiatives");
				}

				done();
		})
		//assert.equal("E2988", employee.EmployeeNumbexr);
	});
});



})
