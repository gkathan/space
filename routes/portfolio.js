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

var boardService= require('../services/BoardService');


module.exports = router;


router.get('/', function(req, res) {
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


router.get('/planningepics', function(req, res) {
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
				var _grouped = _.groupBy(epics,'Status');

				res.locals.planningEpicsBoardId = _planningEpicsBoardId;
				res.locals.roadmapBoardId = _roadmapBoardId;
				res.locals.grouped = _grouped;
				res.locals.statistics=result.statistics;
				res.locals.initiatives = epics;
				res.locals.moment=moment;
				res.locals.lastSync = sync.lastSync;
				res.render('portfolio/planningepics'), { title: 's p a c e - planning epics overview ' }
			});
		});
	});
});

router.get('/planningbacklogs', function(req, res) {
	var _filter = {};
	syncService.getLastSync("v1epics",function(err,sync){
		v1Service.getPlanningBacklogs(_filter,function(err,result){
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
				res.locals.backlogs = _.sortBy(result.backlogs,'Name');
				res.locals.statistics = result.statistics;
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
	var _filter = {};
	syncService.getLastSync("v1epics",function(err,sync){
		v1Service.getPlanningBacklogs(_filter,function(err,result){
			var _backlog = _.findWhere(result.backlogs,{ID:_backlogId});
			res.locals.backlog = _backlog;
			if (_backlog) res.locals.members = _backlog.Members;
			res.locals.moment=moment;
			res.locals.lastSync = sync.lastSync;
			res.render('portfolio/planningbacklogdetail'), { title: 's p a c e - planning backlog detail' }
		});
	});

});
