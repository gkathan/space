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



//unsupported browser landing page
router.get('/chromeonly', function(req, res) {
	res.render('chromeonly', { title: 's p a c e - chrome only' });
});

router.get('/config', function(req, res) {
	ensureAuthenticated(req,res);

	var orgService = require('../services/OrganizationService');
	orgService.findEmployeeByFirstLastName(config.test.user.firstname,config.test.user.lastname,function(employee){
		var os = require('os');
		res.locals.os = os;
		res.locals.employee = employee[0];
		res.render('config');
	});
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


router.get('/firereports', function(req, res) {
	var firereports =  db.collection('firereport');
		firereports.find().sort({$natural:-1}, function (err, docs){
			res.locals.firereports=docs;
			res.render('firereports', { title: 's p a c e - firereports' })
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



/* GET the admin page. */
router.get('/admin', function(req, res) {
	ensureAuthenticated(req,res);
	res.render('admin/admin', { title: 's p a c e - admin' });
});


router.get('/playbooks', function(req, res) {
	res.render('playbooks', { title: 's p a c e - playbooks' });

});



router.get('/boards', function(req, res) {
    ensureAuthenticated(req,res);

	var boards =  db.collection('boards');
	boards.find({}, function (err, docs){
		res.locals.boards=docs;
		console.log(": "+boards[0]);
		res.render('boards', { title: 's p a c e - kanbanboards' });
	});
});



router.get('/sync/v1/epics', function(req, res) {
    // call v1 rest service
    var Client = require('node-rest-client').Client;

	client = new Client();

	V1_DATA_URL = "http://knbnprxy.ea.bwinparty.corp/rest/epics";
	// direct way
	client.get(V1_DATA_URL, function(data, response){
		// parsed response body as js object
		console.log(data);
		// raw response
		console.log(response);
		// and insert
		var v1epics =  db.collection('v1epics');
		v1epics.drop();
		v1epics.insert({createDate:new Date(),epics:JSON.parse(data)}	 , function(err , success){
			//console.log('Response success '+success);
			console.log('Response error '+err);
			if(success){
				res.send("syncv1 called..");
			}
			//return next(err);
		})
	});
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
	ensureAuthenticated(req,res);

	var id = req.params.id;
	var v1epics =  db.collection('v1epics');
		v1epics.find({}, function (err, docs){
		res.locals.kanbanId = id;
		res.locals.epics = docs[0].epics;
		res.render('kanban', { title: 's p a c e - kanban board' })
	});
});


router.get('/logout', function(req, res) {
    console.log("req.session: "+req.session);

    if (req.session){
		console.log("...we have a session...");
		req.session.destroy();
		res.redirect('/login');
	}
});



function ensureAuthenticated(req, res) {
	if (!req.session.AUTH){
		  req.session.ORIGINAL_URL = req.originalUrl;
		  res.redirect("/login");
	}
}
