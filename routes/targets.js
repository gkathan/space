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


//https://github.com/iros/underscore.nest/issues/2
_ = require('underscore');
_.nst = require('underscore.nest');

// run your nesting

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
	_getTargets(_context,function(err,data){
		
		var _L2targets = [];
		var _L1targets = [];
		
		
		if (data.length>0){
			
			for (var i in data){
				if (data[i].type=="target") _L2targets.push(data[i]);
				if (data[i].type=="L1") _L1targets.push(data[i]);
				
				
			}
			var L2targetsClustered = _.nst.nest(_L2targets,["theme","cluster","group"]);
			//var L1targetsClustered = _.nst.nest(_L1targets,["theme"]);
			
			res.locals.targets=L2targetsClustered.children;
			res.locals.L1targets=_L1targets;
			
			
			logger.debug("L1targets: "+_L1targets.length);
			
			// take the first for the globals...
			var _target = L2targetsClustered.children[0].children[0].children[0].children[0];
			res.locals.vision=_target.vision;
			res.locals.start=moment(_target.start).format();
			res.locals.end=moment(_target.end).format();
			res.locals.period = "targets :: "+new moment(_target.start).format('MMMM').toLowerCase()+" - "+new moment(_target.end).format('MMMM').toLowerCase()+" "+new moment(_target.start).format('YYYY');
			
			avService.getLatest(function(av){
				
				res.locals.availability = av;
				
				
				//var orgService = require('../services/OrganizationService');
				//orgService.findEmployeesByFunction("Studios",function(employees){
		
				//res.locals.orgService = orgService;
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


function _getTargets(context,callback){
    
    
	db.collection("targets").find({context:context},function(err,data){
			callback(err,data);
	});
}


function _getL2Targets(context,callback){
    
	db.collection("targets").find({type:"target",context:context},function(err,data){
			callback(err,data);
	});
}


function _getL1Targets(context,callback){
    
	db.collection("targets").find({type:"bonus",context:context},function(err,data){
			callback(err,data);
	});
}



module.exports = router;





