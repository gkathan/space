var express = require('express');
var router = express.Router();
//underscore 
var _ = require('lodash');

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






/** passport authetication
 */
router.post('/', function(req,res,next){
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

module.exports = router;




