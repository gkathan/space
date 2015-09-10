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
		user.authenticate(username, password,function (err, user) {
			console.log("...in authenticate");
			if (err) {
				console.log("...error");
				return done(err);
			}
			if (!user) {
				console.log("...invalid user / or wrong password");
				return done(null, false, { message: 'Unknown user ' + username });
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
  //console.log("deserializing " + JSON.stringify(obj));
  done(null, obj);
});






/** passport authetication
 */
router.post('/', function(req,res,next){
	debugger;
	passport.authenticate('local-signin', function(err,user,info){
		if (err) { return next(err); }
			if (!user) { //return res.render('login');
				return;}
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				console.log("[we are very close :-), req.session.ORIGINAL_URL: "+req.session.ORIGINAL_URL);
				var sess = req.session;
        var _redirect;
        if (user.role=="customer") _redirect ="/dashboard/opsreport";
				sess.AUTH = user.role;
				sess.USER = user.username;
				sess.CONTEXT = user.context;
				//return res.json({detail: info});
				res.send({AUTH:user.role,ORIGINAL_URL:req.session.ORIGINAL_URL,REDIRECT_URL:_redirect});
			});
		})(req, res, next);
});

module.exports = router;
