var winston = require('winston');

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


describe('OrganizationService', function(){
  describe('#findEmployeeByFirstLastName()', function(){
    it('should return a employee record for a given first and last name', function(done){
			var orgService = require('../services/OrganizationService');
      orgService.findEmployeeByFirstLastName("Gerold","Kathan",function(employee){
				console.log("employee found: "+employee);
				assert.equal("E2988", employee["Employee Number"]);
				done();
			});
    })
  })
})
