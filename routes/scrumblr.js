var express = require('express');
var router = express.Router();

var app=require('../app');


router.get('/', function(req, res) {
	//console.log(req.header('host'));
	url = req.header('host') + req.baseUrl;

	var connected = app.io.sockets.connected;
	clientsCount = Object.keys(connected).length;

	res.render('scrumblr/home.jade', {
		url: url,
		connected: clientsCount
	});
});


router.get('/demo', function(req, res) {
	res.render('scrumblr/index.jade', {
		pageTitle: 'scrumblr - demo',
		demo: true
	});
});

router.get('/:id', function(req, res){
	res.render('scrumblr/index.jade', {
		pageTitle: ('scrumblr - ' + req.params.id)
	});
});

module.exports = router;
