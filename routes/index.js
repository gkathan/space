var express = require('express');

var mongojs = require("mongojs");

//underscore
var _ = require('lodash');

var router = express.Router();


var config = require('config');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);

var winston=require('winston');
var logger = winston.loggers.get('space_log');


/* GET home page. */
router.get('/', function(req, res) {
  var cms = require ('../services/ContentService');
  cms.getLatestSpaceNews(config.context,function(content){

	res.locals.spaceNews = content;
	res.locals.moment = require('moment');

	res.render('index', { title: 's p a c e' });
	});
});

module.exports = router;


/* GET the test  page. */
router.get('/test/carousel', function(req, res) {
	res.render('xxx');
});

/* GET the elements test  page. */
router.get('/test/elements', function(req, res) {
	res.render('_elements');
});

router.get('/test/partition', function(req, res) {
	res.sendfile('public/partition.html');
});




//unsupported browser landing page
router.get('/chromeonly', function(req, res) {
	res.render('chromeonly', { title: 's p a c e - chrome only' });
});



router.get('/labels', function(req, res) {
	//res.locals.labels = LabelService.findLabels();
	var labels =  db.collection('labels');
		labels.find({}, function (err, docs){
			//sort
			docs=_.sortBy(docs, "market")
			res.locals.labels=docs;
			res.render('labels', { title: 's p a c e - labels' })
	});
});


router.get('/itservicereports', function(req, res) {
	var itservicereports =  db.collection('itservicereport');
		itservicereports.find().sort({$natural:-1}, function (err, docs){
			res.locals.itservicereports=docs;
			res.render('itservicereports', { title: 's p a c e - IT service reports' })
	});
});

router.get('/customers', function(req, res) {
	//res.locals.customers = CustomerService.findCustomers();
	var customers =  db.collection('customers');
		customers.find({}, function (err, docs){
			//sort
			customers=_.sortBy(docs, "type")
			res.locals.customers=docs;
			res.render('customers', { title: 's p a c e - customers' })
	});
});


router.get('/competitors', function(req, res) {
	//res.locals.customers = CustomerService.findCustomers();
	var competitors =  db.collection('competitors');
		competitors.find({}, function (err, docs){
			//sort
			customers=_.sortBy(docs, "type")
			res.locals.competitors=docs;
			res.render('competitors', { title: 's p a c e - competitiors' })
	});
});




router.get('/playbooks', function(req, res) {
	res.render('playbooks', { title: 's p a c e - playbooks' });
});

router.get('/incidentmatrix', function(req, res) {
	res.render('incidentmatrix', { title: 's p a c e - incidentmatrix' });
});


router.get('/boards', function(req, res) {
  if (ensureAuthenticated(req,res)){
  	var boards =  db.collection('boards');
  	boards.find({}, function (err, docs){
  		res.locals.boards=docs;
  		console.log(": "+boards[0]);
  		res.render('boards', { title: 's p a c e - kanbanboards' });
  	});
  }
});





router.get('/login', function(req, res) {
    if (req.session.AUTH){
		 //res.redirect("/boards");
	 }
    res.render('login', { title: 's p a c e - login' })
});

router.get('/signup', function(req, res) {
    res.render('signup', { title: 's p a c e - signup' })
});



router.get('/kanban/:id', function(req, res) {
	if (ensureAuthenticated(req,res)){
	var id = req.params.id;
  	var v1Service =  require('../services/V1Service');
  		v1Service.findEpics(function (err, docs){
  		res.locals.kanbanId = id;
  		res.locals.epics = docs;
  		res.render('kanban', { title: 's p a c e - kanban board' })
  	});
  }
});


router.get('/logout', function(req, res) {
    if (ensureAuthenticated(req,res)){
		    req.session.destroy();
		    res.redirect('/login');
	  }
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
