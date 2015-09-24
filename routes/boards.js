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
      res.locals.moment=moment;
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

        		res.locals.kanbanId = id;
            res.locals.board=board;
            res.locals.moment = require('moment');
        		res.locals.epics = _items;
        		res.render('board/kanban', { title: 's p a c e - initiative roadmap board' })
    	    });
        }
        else if (board.dataLink=="backlogplanningepics"){
          v1Service.getPlanningBacklogsByEpics({},function (err, epics){
        		logger.debug("board type ="+board.dataLink);
            res.locals.kanbanId = id;
            res.locals.board=board;
            res.locals.moment = require('moment');
        		res.locals.epics = epics;
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })

  	       });
        }
        else if (board.dataLink=="backloginitiatives"){
          v1Service.getPlanningBacklogsByInitiatives({},function (err, inititatives){
        		logger.debug("board type ="+board.dataLink);
            res.locals.kanbanId = id;
            res.locals.board=board;
            res.locals.moment = require('moment');
        		res.locals.epics = inititatives;
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })

  	       });
        }
        else if (board.dataLink=="empty"){
        		logger.debug("board type ="+board.dataLink);
            res.locals.kanbanId = id;
            res.locals.board=board;
            res.locals.moment = require('moment');
        		res.render('board/kanban', { title: 's p a c e - backlog planningepics board' })

        }

        else res.send("no valid dataLink: "+board.dataLink)
  })

});



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
