var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongojs = require("mongojs");

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');

var avService = require('../services/AvailabilityService');
var targetService = require('../services/TargetService');


//https://github.com/iros/underscore.nest/issues/2
_ = require('underscore');
_.nst = require('underscore.nest');


/* GET targets . */
router.get('/overview', function(req, res, next) {
	_handleTargetView(req,res,next,"./targets/overview");
});


router.get('/overview/old', function(req, res, next) {
	_handleTargetView(req,res,next,"targets/overview_old");
});


function _handleTargetView(req,res,next,view){
res.locals._=require('lodash');

	var _context;
	if (req.session.CONTEXT){
		_context = req.session.CONTEXT;
	}
	else
	{
		_context = config.context;
	}

	logger.debug("-------------------------");

	targetService.getAll(_context,function(data){
		var _L2targets = [];
		var _L1targets = [];

		if (data.length>0){
			for (var i in data){
				if (data[i].type=="L2") _L2targets.push(data[i]);
				if (data[i].type=="L1") _L1targets.push(data[i]);
			}
			var L2targetsClustered = _.nst.nest(_L2targets,["theme","cluster","group"]);
			res.locals.targets=L2targetsClustered.children;
			res.locals.L1targets=_L1targets;

			logger.debug("L1targets: "+_L1targets.length);

			// take the first for the globals...
			var _target = L2targetsClustered.children[0].children[0].children[0].children[0];
			res.locals.vision=_target.vision;
			var _colors = _.findWhere(config.entities,{'name':_context}).skin.colors;
			logger.debug("colors: "+_colors.secondary);
			res.locals.colors= _colors;

			res.locals.color_PL = _colors.primary;
			res.locals.color_RUN = _colors.secondary;
			res.locals.color_GROW= _colors.secondary2;
			res.locals.color_TRANSFORM = _colors.secondary3;

			res.locals.start=moment(_target.start).format();
			res.locals.end=moment(_target.end).format();
			res.locals.period = "targets :: "+new moment(_target.start).format('MMMM').toLowerCase()+" - "+new moment(_target.end).format('MMMM').toLowerCase()+" "+new moment(_target.start).format('YYYY');

			avService.getLatest(function(av){
				res.locals.availability = av;
				res.render(view, { title: 's p a c e - targets overview' });
			});
		}
		else{
			res.locals.targets=[];
			res.locals.L1targets=[];
			res.locals.L2targets=[];
			res.locals.vision="undefined";
			res.locals.start="undefined";
			res.locals.end="undefined";
			res.locals.period = "undefined";
			res.locals.availability = {};
			res.render(view, { title: 's p a c e - targets overview' });
		}
	});
}

module.exports = router;
