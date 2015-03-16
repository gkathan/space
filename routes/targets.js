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

	
	res.locals._=require('lodash');
	
	_getTargets(config.entity,function(err,data){
		
		var _L2targets = [];
		var _L1targets = [];
		
		
		if (data.length>0){
			
			for (var i in data){
				if (data[i].type=="target") _L2targets.push(data[i]);
				if (data[i].type=="bonus") _L1targets.push(data[i]);
				
			}
			var L2targetsClustered = _.nst.nest(_L2targets,["theme","cluster","group"]);
			var L1targetsClustered = _.nst.nest(_L1targets,["theme"]);
			
			res.locals.targets=L2targetsClustered.children;
			res.locals.L1targets=L1targetsClustered.children;
			
			res.locals.testTarget=_L2targets[0];
			
			logger.debug("testTarget: "+JSON.stringify(_L2targets[0]));
			
			// take the first for the globals...
			var _target = L2targetsClustered.children[0].children[0].children[0].children[0];
			res.locals.vision=_target.vision;
			res.locals.start=moment(_target.start).format();
			res.locals.end=moment(_target.end).format();
			res.locals.period = "targets :: "+new moment(_target.start).format('MMMM').toLowerCase()+" - "+new moment(_target.end).format('MMMM').toLowerCase()+" "+new moment(_target.start).format('YYYY');
			
			avService.getLatest(function(av){
				
				res.locals.availability = av;
				
				res.render('targets', { title: 's p a c e - targets overview' });

			 });	
		}
		else{
			res.locals.targets=[];
			res.locals.L1targets=[];
			res.locals.vision="undefined";
			res.locals.start="undefined";
			res.locals.end="undefined";
			res.locals.period = "undefined";
			res.locals.availability = {};
			res.render('targets', { title: 's p a c e - targets overview' });
		}
		
		
		
	});
});


function _getTargets(entity,callback){
    
    
	db.collection("targets").find({entity:entity},function(err,data){
			callback(err,data);
	});
}


function _getL2Targets(entity,callback){
    
	db.collection("targets").find({type:"target",entity:entity},function(err,data){
			callback(err,data);
	});
}


function _getL1Targets(entity,callback){
    
	db.collection("targets").find({type:"bonus",entity:entity},function(err,data){
			callback(err,data);
	});
}



module.exports = router;





