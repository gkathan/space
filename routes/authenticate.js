var express = require('express');
var router = express.Router();

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

//underscore
var _ = require('lodash');

var spaceServices=require('space.services');

var config = require('config');
var _secret = require("../config/secret.json");


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , WindowsStrategy = require('passport-windowsauth');


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
				console.log("[local-signin] says ...invalid user / or wrong password");
				return done(null, false, { message: 'Unknown user ' + username });
			}
			console.log("...[OK]");
			return done(null, user);
		});
  }
));



passport.use('bptyAD-signin',new WindowsStrategy({
  ldap: {
    url:             _secret.ldap.url,
    base:            _secret.ldap.base,
    bindDN:          _secret.ldap.bindDN,
    bindCredentials: _secret.ldap.bindCredentials
  },
  integrated:false
}, function(profile, done){
  if (profile){
    //console.log("waId.profile.id: "+profile.id);
    //console.log(JSON.stringify(profile));

    //extract user from AD profile !
    var user = {};

    user.id=profile.id;
    user.username=profile._json.sAMAccountName;
    user.emails = profile.emails;
    user.division=profile._json.division;
    user.department=profile._json.department;
    user.displayname = profile.displayName;
    user.title=profile._json.title;
    user.location= profile._json.physicalDeliveryOfficeName;
    user.tel=profile._json.telephoneNumber;
    user.role="bpty";

    logger.debug("profile.memberOf: "+profile._json.memberOf);
    logger.debug("user: "+JSON.stringify(user));

    if (profile._json.memberOf.indexOf("CN=pap.space.admin,OU=PermApp,OU=Groups,OU=ADM01,OU=AT,OU=CORP,DC=icepor,DC=com")>-1){
      //user.role="admin";
    }
    user.context="bpty.studios";
  }
  else{
    console.log("sorry no profile found");
  }
  done (null,user);
}));

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
	//chained authentication providers
  passport.authenticate(['local-signin','bptyAD-signin'], function(err,user,info){
		if (err) { return next(err); }
      logger.debug("..... in authenticate....."+user+" "+info);
      if (!user) { //return res.render('login');
        logger.debug("....... no user - return")
        return;
      }
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				console.log("[we are very close :-), req.session.ORIGINAL_URL: "+req.session.ORIGINAL_URL);
        console.log("[we are very close :-), req.originalUrl: "+req.originalUrl);

				var sess = req.session;
        var _redirect;
        if (user.role=="customer") _redirect ="/dashboard/opsreport";

				sess.AUTH = user.role;
        sess.USER = user.username;
				sess.CONTEXT = user.context;

        if (user.displayname){
          sess.DISPLAYNAME = user.displayname;
          sess.DIVISION = user.division;

          var orgService = spaceServices.OrganizationService;
          var _displayname = user.displayname;
          var _first = _displayname.split(" ")[0];
          var _last = _.last(_displayname.split(" "));

          orgService.findEmployeeByFirstLastName(_first,_last,function(err,employee){
            if (employee)
              sess.EMPLOYEEID=employee["Employee Number"];
    				res.send({AUTH:user.role,ORIGINAL_URL:req.session.ORIGINAL_URL,REDIRECT_URL:_redirect});
            return;
          });
        }
        else
				    res.send({AUTH:user.role,ORIGINAL_URL:req.session.ORIGINAL_URL,REDIRECT_URL:_redirect});
			});
		})(req, res, next);
});

module.exports = router;
