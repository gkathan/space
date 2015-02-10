/**
  /incidents routes
*/
var mongojs = require("mongojs");
var nodeExcel = require('excel-export');
var express = require('express');
var router = express.Router();
var _ = require('underscore');

var DB="kanbanv2";

var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);





router.get("/", function(req, res, next) {

	

	res.render("incidents");
	
});


module.exports = router;




