var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongojs = require('mongojs');
var moment = require('moment');
var _ = require('lodash');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

var spaceServices=require('space.services');
var portfolioService =spaceServices.PortfolioService;
var v1Service = spaceServices.V1Service;
var syncService =spaceServices.SyncService;
var orgService =spaceServices.OrganizationService;


var boardService= require('../services/BoardService');


module.exports = router;


router.get('/', function(req, res) {
	req.session.ORIGINAL_URL = req.originalUrl;
	// join pgates with epics
	var _type = "current";
	portfolioService.getPortfolioMeetings(_type,function(err,result){
		//slogger.debug("---------------------------------------- targetContributionBucket: "+JSON.stringify(_gates));
		// do not show the "first" as this is just needed to be the baseline of the delat informations
		res.locals.pgates=_.initial(result.meetings);
		res.locals.moment=moment;
		res.locals.states=result.states;
		res.locals.colors=result.colors;
		res.locals.type=_type;
		res.locals.v1LastUpdate=result.V1LastUpdate;
		res.render('portfolio/portfoliogate'), { title: 's p a c e - portfoliogate' }
	});
});

router.get('/history', function(req, res) {
	// join pgates with epics
	var _type = "history";
	portfolioService.getPortfolioMeetings(_type,function(err,result){
		//slogger.debug("---------------------------------------- targetContributionBucket: "+JSON.stringify(_gates));
		// do not show the "first" as this is just needed to be the baseline of the delat informations
		res.locals.pgates=_.initial(result.meetings);
		res.locals.moment=moment;
		res.locals.states=result.states;
		res.locals.colors=result.colors;
		res.locals.v1LastUpdate=result.V1LastUpdate;
		res.locals.type=_type;
		res.render('portfolio/portfoliogate'), { title: 's p a c e - portfoliogate' }
	});
});


router.get('/initiativeepics', function(req, res) {
	var _filter = {};
	syncService.getLastSync("v1epics",function(err,sync){
		v1Service.getPlanningInitiatives(_filter,function(err,result){
			boardService.find({},function(err,boards){
				var _planningEpicsBoardId;
				var _roadmapBoardId;
				if (boards){
					// "ipe" stands for "initiatives 2 planning epics"
					if (_.findWhere(boards,{ref:"ipe"})) _planningEpicsBoardId = _.findWhere(boards,{ref:"ipe"})._id;
					// "rcs" stands for roadmap clustered by status
					if (_.findWhere(boards,{ref:"rcs"})) _roadmapBoardId = _.findWhere(boards,{ref:"rcs"})._id;
				}
				var _swagSum=0;;
				var _valueSum=0;;
				var _riskSum=0;;
				var epics = result.initiatives;
				var _grouped;
				if (epics.length>0){
					_.groupBy(epics,'Status');
				}
				res.locals.planningEpicsBoardId = _planningEpicsBoardId;
				res.locals.roadmapBoardId = _roadmapBoardId;
				res.locals.grouped = _grouped;
				res.locals.statistics=result.statistics;
				res.locals.initiatives = epics;
				res.locals.moment=moment;
				res.locals.lastSync = sync.lastSync;
				res.render('portfolio/initiativeepics'), { title: 's p a c e - initiative epics overview ' }
			});
		});
	});
});

router.get('/planningbacklogs', function(req, res) {

	//var _jobfamilies=["Software Developer","Test Engineer"];
	var _jobfamilies=config.backlogs.filter.includeJobFamily;


	var _filter = {includeOnlyJobfamily:_jobfamilies};
	//var _filter={};

	syncService.getLastSync("v1epics",function(err,sync){
		v1Service.getPlanningBacklogs(_filter,function(err,backlogs){
			boardService.find({},function(err,boards){
				logger.debug("looking for boards: ....................."+boards.length);
				var _planningEpicsBoardId;
				var _initiativesBoardId;
				var _roadmapBoardId;
				if (boards){
					if (_.findWhere(boards,{ref:"bpe"})) _planningEpicsBoardId = _.findWhere(boards,{ref:"bpe"})._id;
					if (_.findWhere(boards,{ref:"bi"})) _initiativesBoardId = _.findWhere(boards,{ref:"bi"})._id;
					if (_.findWhere(boards,{ref:"rcs"})) _roadmapBoardId = _.findWhere(boards,{ref:"rcs"})._id;
				}

				var _members =[];

				for (var b in backlogs.backlogs){
					var _backlog = backlogs.backlogs[b];

					_members = _.union(_members,_backlog.Members);
				}

				var _jf = _.groupBy(_members,"JobFamily");

				var _jobfamilystat="";
				for (var k in _.keys(_jf)){
					var _family = _.keys(_jf)[k];
					logger.debug("_family: "+_family);
					_jobfamilystat+=_family+" ["+_jf[_family].length+"] ";
				}

				res.locals.jobfamilies = _jobfamilystat;


				res.locals.backlogs = _.sortBy(backlogs.backlogs,'Name');
				res.locals.statistics = backlogs.statistics;
				res.locals.moment=moment;
				res.locals.planningEpicsBoardId = _planningEpicsBoardId;
				res.locals.initiativesBoardId = _initiativesBoardId;
				res.locals.roadmapBoardId = _roadmapBoardId;
				res.locals.lastSync = sync.lastSync;
				res.render('portfolio/planningbacklogs'), { title: 's p a c e - planning backlogs overview ' }
			})
		})
	})
});

router.get('/planningbacklogdetail/:id', function(req, res) {
	var _backlogId = req.params.id;

	var _jobfamilies=config.backlogs.filter.includeJobFamily;
	//var _jobfamilies=["Test Engineer"];
	var _filter = {includeOnlyJobfamily:_jobfamilies};

	syncService.getLastSync("v1epics",function(err,sync){
		v1Service.getPlanningBacklogs(_filter,function(err,result){
			var _backlog = _.findWhere(result.backlogs,{ID:_backlogId});
			var _first;
			var _last;
			var _split;
			if (_backlog && _backlog.Owner){
				_split = _backlog.Owner.split(" ");
				_first = _.initial(_split).join(" ");
				_last = _.last(_split)
			}
			orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){
					res.locals.backlog = _backlog;
					if (_backlog) res.locals.members = _backlog.Members;
					res.locals.moment=moment;
					res.locals.owner=employee;
					res.locals.lastSync = sync.lastSync;
					res.render('portfolio/planningbacklogdetail'), { title: 's p a c e - planning backlog detail' }
			})
		});
	});
});
