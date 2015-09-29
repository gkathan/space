var express = require('express');
var mongojs = require("mongojs");

//underscore
var _ = require('lodash');

var router = express.Router();
var moment = require('moment');

var config = require('config');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');

module.exports = router;

router.get('/', function(req, res) {
  if (ensureAuthenticated(req,res)){
  	var boardService =  require('../services/BoardService');
  	boardService.find({}, function (err, docs){
  		res.locals.boards=docs;
      res.locals.formBoardTitle="CREATE NEW BOARD"
      res.locals.createNew =true;
      res.locals.moment=moment;
      res.locals.board = initializeEmptyBoard();
  		//console.log(": "+boards[0]);
  		res.render('board/boards', { title: 's p a c e - kanbanboards' });
  	});
  }
});


router.get('/kanban/:id', function(req, res) {
	var id = req.params.id;
  	var v1Service =  require('../services/V1Service');
    var boardService = require('../services/BoardService');
  		boardService.findById(id,function(err,board){
        if (!board){
          res.send("sorry no board for id: "+id);
          return;
        }
        logger.debug("loading board... board type ="+board.dataLink);

    		logger.debug("board type ="+board.dataLink);
        res.locals.kanbanId = id;
        res.locals.board=board;
        res.locals.formBoardTitle="UPDATE BOARD "+id;
        res.locals.moment = require('moment');


        if (board.dataLink=="roadmapinitiatives"){
          var _filter={};
          v1Service.getRoadmapInitiatives(_filter,function (err, docs){
            var _items = [];
            for (var i in docs){
              var _r = docs[i];
              if (_r.Value && _r.Swag && (_r.Status=="New" || _r.Status=="Understanding" || _r.Status=="Conception" || _r.Status=="Implementation")){
                _items.push(_r);
              }
            }
        		res.locals.epics = _items;
        		res.render('board/kanban', { title: 's p a c e - initiative roadmap board' })
    	    });
        }
        else if (board.dataLink=="backlogplanningepics"){
          v1Service.getPlanningBacklogsByEpics({},function (err, epics){
        		res.locals.epics = epics;
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })
  	       });
        }
        else if (board.dataLink=="backloginitiatives"){
          v1Service.getPlanningBacklogsByInitiatives({},function (err, inititatives){
        		res.locals.epics = inititatives;
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })
  	       });
        }
        else if (board.dataLink=="empty"){
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })
        }
        else res.send("no valid dataLink: "+board.dataLink)
  })
});


	function initializeEmptyBoard(){
		var _board = {};
    _board.name="";
    _board.vision="";
    _board.subvision="";
    _board.mission="";
    _board.startDate=moment().subtract("months",3).format("YYYY-MM-DD");
    _board.endDate=moment().add("months",18).format("YYYY-MM-DD");
    _board.height = 2000;
    _board.width = 1500;
    _board.itemScale = 0.7;
    _board.itemFontScale = 5;
    _board.WIPWindowDays = 90;
    _board.groupby = "Product,BusinessBacklog,Number";
    _board.ref="";
    _board.dataLink="";


		// default viewconfig
		var _viewConfig ={};
		_viewConfig.vision="show";
		_viewConfig.metrics="off";
		_viewConfig.queues="show";
		_viewConfig.queuesmetrics="show";
		_viewConfig.swag="hide";
		_viewConfig.start="show";
		_viewConfig.targets="off";
		_viewConfig.initiatives="show";
		_viewConfig.guides="show";
		_viewConfig.targets="off";
		_viewConfig.lanes="show";
		_viewConfig.grid="show";
		_viewConfig.axes="show";
    _viewConfig.guides="hide";
		_viewConfig.sublaneText="off";

		_viewConfig.laneboxText = {size:"8px",color:"grey",weight:"normal",mode:""};
		_viewConfig.contextboxText = {"size":"8px","color":"grey","weight":"normal","mode":"tb"};
		_viewConfig.offsetTop = 0;
		_viewConfig.contextboxWidth = 30;
		_viewConfig.laneboxLeftWidth = 120;
		_viewConfig.laneboxRightWidth = 10;

    var _filter ={};
    _filter.Targets="";
    _filter.Customers="";
    _filter.Markets="";
    _filter.Product="";
    _filter.Status="";


		_board.viewConfig = _viewConfig;
    _board.filter = _filter;
    _board.items=[];

		return _board;
	}



function ensureAuthenticated(req, res) {
	logger.debug("[CHECK AUTHENTICATED]");
  if (!req.session.AUTH){
		  logger.debug("[*** NOT AUTHENTICATED **]");
      req.session.ORIGINAL_URL = req.originalUrl;
		  res.redirect("/login");
      return false
	}
  return true;
}
