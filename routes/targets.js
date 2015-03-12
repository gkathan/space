var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongojs = require("mongojs");

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);




//https://github.com/iros/underscore.nest/issues/2
_ = require('underscore');
_.nst = require('underscore.nest');

// run your nesting

/* GET targets . */
router.get('/overview', function(req, res, next) {
/*
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
	}
	*/
	_getTargets(function(err,data){
		
		var _L2targets = [];
		var _L1targets = [];
		
		for (var i in data){
			if (data[i].type=="target") _L2targets.push(data[i]);
			if (data[i].type=="bonus") _L1targets.push(data[i]);
			
		}
		
		
		
		var L2targetsClustered = _.nst.nest(_L2targets,["theme","cluster","group"]);
		var L1targetsClustered = _.nst.nest(_L1targets,["theme"]);
		
		res.locals.targets=L2targetsClustered.children;
		res.locals.L1targets=L1targetsClustered.children;
		
		// take the first for the globals...
		var _target = L2targetsClustered.children[0].children[0].children[0].children[0];
		res.locals.vision=_target.vision;
		res.locals.start=moment(_target.start).format();
		res.locals.end=moment(_target.end).format();
		res.locals._=require('lodash');
		res.locals.period = "targets :: "+new moment(_target.start).format('MMMM').toLowerCase()+" - "+new moment(_target.end).format('MMMM').toLowerCase()+" "+new moment(_target.start).format('YYYY');
		
			
		res.render('targets', { title: 's p a c e - targets overview' });

		
		
	});
});


function _getTargets(callback){
    
	db.collection("targets").find({},function(err,data){
			callback(err,data);
	});
}


function _getL2Targets(callback){
    
	db.collection("targets").find({type:"target"},function(err,data){
			callback(err,data);
	});
}


function _getL1Targets(callback){
    
	db.collection("targets").find({type:"bonus"},function(err,data){
			callback(err,data);
	});
}



module.exports = router;





