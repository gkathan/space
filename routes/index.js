var express = require('express');

var mongojs = require("mongojs");
var config = require('config');
//test to include stuff
//var api=require('./api.js');

//underscore 
var _ = require('lodash');

var router = express.Router();

var DB="kanbanv2";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);



/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'kanbanv2 - strategy2tactics' });
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
	res.render('chromeonly');
});

router.get('/config', function(req, res) {
	res.render('config');
});

router.get('/labels', function(req, res) {
	
	//res.locals.labels = LabelService.getLabels();
	
	var labels =  db.collection('labels');
		labels.find({}, function (err, docs){
			//sort
			docs=_.sortBy(docs, "market")
			
			res.locals.labels=docs;
			res.render('labels')
	});
		
});



/* GET the admin page. */
router.get('/admin', function(req, res) {
	if (!req.session.AUTH){
		  req.session.ORIGINAL_URL = req.originalUrl;
		  res.redirect("/login");
	}
	res.render('admin/admin');
});







router.get('/dashboard', function(req, res) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
	res.render('dashboard'), {title:"dashboard"}
		
});


router.get('/targets', function(req, res) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
	res.render('targets'), {title:"targets"}
		
});

router.get('/playbooks', function(req, res) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
	res.render('playbooks'), {title:"playbooks"}
		
});




router.get('/boards', function(req, res) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
		
		var boards =  db.collection('boards');
		boards.find({}, function (err, docs){
			res.locals.boards=docs;
			console.log(": "+boards[0]);
			res.render('boards'), {title:"boards"}
		});
});



/** REST API 
 * */
router.post('/authenticate', function(req, res) {
    // do authetication handling
    var sha1 = require('sha1');
    var auth;
    var uid = req.body.uid;
    var pwd = req.body.pwd
    
    console.log("...authenicate request: uid: "+uid+ "pwd: "+pwd);
    
    var sess = req.session;
    
    // :o) the simplest possible user store .....
    if (uid=="bpty" && sha1($pwd)=="d95575af5968042ad37a64d89ee8eb92b7c8c947") auth="bpty";
    else if (uid=="exec" && sha1(pwd)=="2d2bea78d8b52e14eaf8f20b3288c28fc76e1654") auth="exec";
    else if (uid=="admin" && sha1(pwd)=="40dc6c3b5c6595384395164908da32c18ae9dfc9") auth="admin";
    
    // set session variable
    console.log("...auth: "+auth);
    if (auth) sess.AUTH=auth;
    
    res.send({AUTH:auth,ORIGINAL_URL:req.session.ORIGINAL_URL});
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
    res.render('login', { title: 'kanban login' })
});


router.get('/kanban/:id', function(req, res) {
    if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}
    var id = req.params.id;
    res.locals.kanbanId = id;
    res.render('kanban', { title: 'kanban' })
});


router.get('/logout', function(req, res) {
    if (req.session){
		req.session.destroy();
		res.redirect('/login');
	}
	res.redirect("/login");
});
