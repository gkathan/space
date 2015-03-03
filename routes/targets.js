var express = require('express');
var router = express.Router();
var moment = require('moment');


//https://github.com/iros/underscore.nest/issues/2
_ = require('underscore');
_.nst = require('underscore.nest');

// run your nesting

/* GET targets . */
router.get('/overview', function(req, res, next) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
	_getTargets(function(err,data){
		var targetsClustered = _.nst.nest(data,["theme","cluster","group"]);
		for (var i in targetsClustered.children){
			//console.log("*cluster.name "+targetsClustered[i].name+" children: "+targetsClustered[i].children);
			console.log("*cluster.name ");
		}
		res.locals.targets=targetsClustered.children;
		// take the first for the globals...
		var _target = targetsClustered.children[0].children[0].children[0].children[0];
		res.locals.vision=_target.vision;
		res.locals.start=moment(_target.start).format();
		res.locals.end=moment(_target.end).format();
		res.locals.period = "targets :: "+moment(_target.start).format('MMMM').toLowerCase()+" - "+moment(_target.end).format('MMMM').toLowerCase()+" "+moment(_target.start).format('YYYY');
		
	res.render('targets');
	});
});


function _getTargets(callback){
    var mongojs = require("mongojs");
	var DB="kanbanv2";
	var connection_string = '127.0.0.1:27017/'+DB;
	var db = mongojs(connection_string, [DB]);
	db.collection("targets").find({},function(err,data){
			callback(err,data);
	});
}


module.exports = router;





