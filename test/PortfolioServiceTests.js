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


describe('PortfolioServices', function(){

  describe('get current approved initiatives', function(){
    it('shall fetch latest portfolio and extract flat initaitves', function(done){
      var portfolioService = require('../services/PortfolioService');

			portfolioService.getCurrentApprovedInitiatives(function(err,results){
				logger.debug("getCurrentApprovedInitiatives : "+results.length);
				for (var p in results){
					console.log("initiative: "+results[p].EpicRef+" - "+results[p].Status);
				}



				done();
			})
		});
	});




})
