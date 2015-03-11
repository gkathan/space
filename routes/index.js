var express = require('express');

var mongojs = require("mongojs");
var config = require('config');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


var user = require('../services/UserService');


passport.use('local-signin', new LocalStrategy(
	{passReqToCallback : true}, // allows us to pass back the request to the callback
	function(req,username, password, done) {
		
		console.log("....trying to authenticate");
		debugger;
		
		user.findByUsername(username, function (err, user) {
			console.log("...in find");
			if (err) { 
				console.log("...error");
				return done(err); 
			}
			if (!user) { 
				console.log("...invalid user");
				return done(null, false, { message: 'Unknown user ' + username });
			}
			if (user.password != password) {
				 console.log("...wrong password");
				 return done(null, false, { message: 'Invalid password' }); 
			}
			console.log("...[OK]");
			return done(null, user);
		  
		});
		
  }
));

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + JSON.stringify(obj));
  done(null, obj);
});

//underscore 
var _ = require('lodash');

var router = express.Router();


var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);




/* GET home page. */
router.get('/', function(req, res) {
    
    
    res.render('index', { title: 's p a c e' });
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
	var os = require('os');
	res.locals.os = os;	
	res.render('config');
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
	if (!req.session.AUTH){
		  req.session.ORIGINAL_URL = req.originalUrl;
		  res.redirect("/login");
	}
	res.render('admin/admin', { title: 's p a c e - admin' });
});







router.get('/dashboard', function(req, res) {
    //if (!req.session.AUTH){
	if (!req.session.AUTH){	
			req.session.ORIGINAL_URL = req.originalUrl;
			console.log("no req.session.AUTH found: ");
			res.redirect("/login");
		}
	else res.render('dashboard', { title: 's p a c e - dashboards' });
		
});


router.get('/playbooks', function(req, res) {
    if (!req.session.AUTH){
			req.session.ORIGINAL_URL = req.originalUrl;
			res.redirect("/login");
		}
	res.render('playbooks', { title: 's p a c e - playbooks' });
		
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
			res.render('boards', { title: 's p a c e - kanbanboards' });
		});
});



/** legacy auth
 * */
/*
router.post('/authenticate', function(req, res) {
    // do authetication handling
    var sha1 = require('sha1');
    var auth;
    var uid = req.body.username;
    var pwd = req.body.password
    
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
*/



/** passport authetication
 */
router.post('/authenticate', function(req,res,next){
	debugger;
	passport.authenticate('local-signin', function(err,user,info){
		if (err) { return next(err); }
			if (!user) { return res.render('login'); }
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				console.log("[we are very close :-), req.session.ORIGINAL_URL: "+req.session.ORIGINAL_URL);
				var sess = req.session;
				sess.AUTH=user.role;
				//return res.json({detail: info});
				res.send({AUTH:user.role,ORIGINAL_URL:req.session.ORIGINAL_URL});
			});
		})(req, res, next);
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
    if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}
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
	//res.redirect("/login");
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
