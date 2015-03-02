var express = require('express');
var router = express.Router();


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
		var targetsClustered = _.nst.nest(data,["cluster","group"]);
		for (var i in targetsClustered.children){
			//console.log("*cluster.name "+targetsClustered[i].name+" children: "+targetsClustered[i].children);
			console.log("*cluster.name ");
		}
		res.locals.targets=targetsClustered.children;
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





