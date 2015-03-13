var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');


var avService = require('../services/AvailabilityService');



//
router.get('/', function(req, res) {
    //if (!req.session.AUTH){
	if (!req.session.AUTH){	
			req.session.ORIGINAL_URL = req.originalUrl;
			console.log("no req.session.AUTH found: ");
			res.redirect("/login");
		}
	else{
		 avService.getLatest(function(av){
			
			res.locals.availability = av;
			res.locals.downtime = avService.getDowntimeYTD(av.unplannedYTD,av.week);
			res.locals.targetDowntime = avService.getDowntimeYTD(av,52);
			res.locals.leftDowntime = avService.getDowntimeYTD(av,52);
			res.render('dashboard', { title: 's p a c e - dashboards' });
		 });
	}
});

module.exports = router;





