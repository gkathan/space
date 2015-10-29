/**
  /org routes
*/
var mongojs = require("mongojs");
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');
require('moment-duration-format');

var config = require('config');
var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);


var winston=require('winston');
var logger = winston.loggers.get('space_log');

var spaceServices=require('space.services');
var authService = require('../services/AuthService');

/* GET the admin page. */
router.get('/', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
	   res.render('admin/admin', { title: 's p a c e - admin' });
  }
	else res.redirect("/login");
});

/* GET the admin page. */
router.get('/message', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
	   res.render('admin/message', { title: 's p a c e - admin.message' });
  }
	else res.redirect("/login");
});

/* GET the admin page. */
router.get('/content', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
		res.render('admin/content', { title: 's p a c e - admin.content' });
  }
	else res.redirect("/login");
});


router.get('/traffic', function(req, res) {
	var _year = moment().year();
	var _month = moment().format("MM");
	var _period = +_year+'-'+_month;
	logger.debug("...redirect to : "+_period);

	res.redirect('/admin/traffic/'+_period);
})

/* GET the traffic page. */
router.get('/traffic/:period', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
		var _period = req.params.period;

		if (_period){
			_year=_period.split("-")[0];
			_month=_period.split("-")[1];
		}

		var fetch = require('node-fetch');


		var _protocol="http";

		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

		var _url= "http://ea.bwinparty.corp/nginxlive/rest/hits/"+_year+"/"+_month;
		logger.info("config.env: "+config.env);
		if (config.env =="PRODUCTION")
			_url = "https://ea.bwinparty.corp/nginxlive/rest/hits/"+_year+"/"+_month;

		var traffic=[];

		fetch(_url)
		  .then(function(res) {
		       return res.json();
		  }).then(function(data) {
			var _totalHits = 0;
			for (var d in data){
				var _d = data[d];
				if (_d._id.host=="space.bwinparty.corp"){
					 traffic.push(_d);
					 _totalHits+=_d.hits
				 }
			}
			res.locals.traffic = traffic;
			res.locals.moment = moment
			res.locals.month = _month;
			res.locals.year = _year;
			res.locals.totalHits = _totalHits;
			res.locals.period = moment(_year+"-"+_month+"01", "YYYY-MM-DD").format("MMMM YYYY");
			res.render('admin/traffic', { title: 's p a c e - admin.traffic' });
		});
  }
	else res.redirect("/login");
});

/* GET the admin page. */
router.get('/sync', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
		var syncService = spaceServices.SyncService;

		var _syncServer=config.syncUpdate.url;

		//_syncServer="http://localhost:8001/"

		// and get sync config from space.syncers
		var Client = require('node-rest-client').Client;
		var _options = {timeout:1000};
		logger.debug("------ admin fetches space.syncer config from: "+_syncServer);
		client = new Client(_options);// direct way
		// direct way
		client.get(_syncServer, function(data, response,done){

				var _syncConfig = data;

				var syncers =[];
				_.forEach(_syncConfig,function(n,key){
					if(key=="apm"){
							_.forEach(n,function(sub,subkey){
									syncers.push({name:key+"."+subkey,sync:sub});
							})
					}
					else syncers.push({name:key,sync:n})
				});

				res.locals.moment = moment;

				syncService.getLastSyncs(syncers,function(err,syncInfos){
						for (var i in syncInfos){
							if (syncInfos[i]){
								logger.debug("+++++++++++++ syncInfo: "+JSON.stringify(syncInfos[i]));
								logger.debug("+++++++++++++ syncInfo.name: "+syncInfos[i].name);
								_.findWhere(syncers,{"name":syncInfos[i].name}).syncInfo= syncInfos[i];
							}
						}
						//res.locals.syncInfos=syncInfos;
						res.locals.syncers=syncers;
						res.render('admin/sync', { title: 's p a c e - admin.sync' });
						return;
				})
			}).on('error',function(err){
				logger.error("something went wrong: "+err.message);
				res.locals.error=err.message;
				res.render('admin/sync', { title: 's p a c e - admin.sync' });
			})
  }
	else res.redirect("/login");
});

router.get('/config', function(req, res) {
	if (authService.ensureAuthenticated(req,res,["admin"])){
    var os = require('os');
    var json2html = require('node-json2html');
    var configHtml = json2html.transform(JSON.stringify(config));


    logger.debug("config:"+config)
    logger.debug("configHtml:"+configHtml)

		res.locals.os = os;
    res.locals.configHtml = configHtml;

		res.render('admin/config');
  }
	else res.redirect("/login");
});


module.exports = router;
