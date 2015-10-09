var express = require('express');
var router = express.Router();

var app=require('../app');

var winston=require('winston');
var logger = winston.loggers.get('space_log');

router.get('/', function(req, res) {
	ensureAuthenticated(req,res);
	//console.log(req.header('host'));
	url = req.header('host') + req.baseUrl;

	var scrumblrService = require('../services/scrumblr/ScrumblrService');

	/*
	var connected = app.io.sockets.connected;
	clientsCount = Object.keys(connected).length;
*/
	res.render('scrumblr/home.jade', {
		url: url,
		connected: scrumblrService.getConnections()
	});

});


router.get('/demo', function(req, res) {
	res.render('scrumblr/index.jade', {
		pageTitle: 'scrumblr - demo',
		demo: true
	});
});

router.get('/:id', function(req, res){
	res.locals.board=req.params.id;
	res.render('scrumblr/index.jade', {
		pageTitle: ('scrumblr - ' + req.params.id)

	});
});

module.exports = router;


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
