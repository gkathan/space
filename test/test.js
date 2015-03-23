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
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})


describe('OrganizationService', function(){
  describe('#findEmployeeByFirstLastName()', function(){
    it('should return a employee record for a given first and last name', function(){
      
      var orgService = require('../services/OrganizationService');
      var employee = orgService.findEmployeeByFirstLastName("Gerold","Kathan",function(employee){
			
			assert.equal("E2988", employee.EmployeeNumbexr);
			
		});
      
      
      
    })
  })
})
