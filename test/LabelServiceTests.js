var winston = require('winston');
var _ = require('lodash');

winston.loggers.add('test_log',{
	console:{
		colorize:true,
		prettyPrint:true,
		showLevel:true,
		timestamp:true,
		level:"debug"
	},
    file:{
		filename: 'logs/test.log' ,
		prettyPrint:true,
		showLevel:true,
		level:"debug"
	}
});

var logger = winston.loggers.get('test_log');
var assert = require("assert")


describe('LabelServices', function(){

  describe('label2customer mapping', function(){
    it('bla', function(done){
      var labelService = require('../services/LabelService');
			var _filter = {customer:"bwin"};
			labelService.findLabel2Customer(_filter,function(err,results){
				logger.debug("_findLabel2Customer : "+JSON.stringify(results));

				// bwin has currently 7 labels
				assert.equal(7, results.length);
				done();
			})
		});
	});

	describe('check incident.label comma delimited against a customer filter', function(){
    it('bla', function(done){
      var labelService = require('../services/LabelService');
			var _customer = "bwin";
			var _incident = {label:"danskaspil.dk"};

			labelService.excludeIncidentForCustomer(_incident,_customer,function(err,result){
				logger.debug("checkIncidentsFilter : ");
				// bwin has currently 7 labels
				assert.equal(true, result);
				done();
			})
		});
	});

	describe('check incident.label comma delimited against a customer filter', function(){
    it('bla', function(done){
      var labelService = require('../services/LabelService');
			var _customer = "bwin";
			var _incident = {label:"bwin.com, danskaspil.dk"};

			labelService.excludeIncidentForCustomer(_incident,_customer,function(err,result){
				logger.debug("checkIncidentsFilter : ");
				// bwin has currently 7 labels
				assert.equal(false, result);
				done();
			})
		});
	});


describe('check incident.label comma delimited against a customer filter', function(){
	it('bla', function(done){
		var labelService = require('../services/LabelService');
		var _customer = "bwin";
		var _incident = {label:"No Label"};

		labelService.excludeIncidentForCustomer(_incident,_customer,function(err,result){
			logger.debug("checkIncidentsFilter : ");
			// bwin has currently 7 labels
			assert.equal(false, result);
			done();
		})
	});
});



})
