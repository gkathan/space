/**
  /org routes
*/
var mongojs = require("mongojs");
var express = require('express');
var router = express.Router();
var _ = require('lodash');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);


var winston=require('winston');
var logger = winston.loggers.get('space_log');








/* GET the admin page. */
router.get('/', function(req, res) {
	if (ensureAuthenticated(req,res)){
	   res.render('admin/admin', { title: 's p a c e - admin' });
  }
});

/* GET the admin page. */
router.get('/message', function(req, res) {
	if (ensureAuthenticated(req,res)){
	   res.render('admin/message', { title: 's p a c e - admin.message' });
  }
});

/* GET the admin page. */
router.get('/content', function(req, res) {
	if (ensureAuthenticated(req,res)){

		res.render('admin/content', { title: 's p a c e - admin.content' });
  }
});

/* GET the admin page. */
router.get('/sync', function(req, res) {
	if (ensureAuthenticated(req,res)){
		var sync=config.sync;
		var syncers =[];
		_.forEach(sync,function(n,key){
			if(key=="apm"){
					_.forEach(n,function(sub,subkey){
							syncers.push({name:key+"."+subkey,sync:sub});
					})
			}
			else syncers.push({name:key,sync:n})
		});

		res.locals.syncers=syncers;
	   res.render('admin/sync', { title: 's p a c e - admin.sync' });
  }
});

/* GET the admin page. */
router.get('/changelog', function(req, res) {
	  var changelog=require('../changelog.json');
		res.locals.changelog=changelog;

		res.render('admin/changelog', { title: 's p a c e - admin.changelog' });

});

router.get('/config', function(req, res) {
	if (ensureAuthenticated(req,res)){
    var os = require('os');
    var json2html = require('node-json2html');
    var configHtml = json2html.transform(JSON.stringify(config));


    logger.debug("config:"+config)
    logger.debug("configHtml:"+configHtml)

		res.locals.os = os;
    res.locals.configHtml = configHtml;

		res.render('admin/config');
  }
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
