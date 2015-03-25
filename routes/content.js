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







router.get("/", function(req, res, next) {
	res.render("content");
});

module.exports = router;
