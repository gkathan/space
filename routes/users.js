var express = require('express');
var router = express.Router();



//var phantom = require('phantom');




/* GET users listing. */
router.get('/', function(req, res, next) {
/*
	console.log("get called ***");
	phantom.create(function (ph) {
	  console.log("phantom.create called ***");
	  ph.createPage(function (page) {
	
		page.open('https://www.bwin.com', function() {
		page.render('example.png');
		console.log("***");
		});



	  });
	}, {
	  dnodeOpts: {
		weak: false
	  }
	});
*/


  res.send('respond with a resource');
});

module.exports = router;





