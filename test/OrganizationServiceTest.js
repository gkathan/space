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
      orgService.findEmployeeByFirstLastName("Gerold","Kathan",function(err,employee){
				console.log("employee found: "+employee);
				assert.equal("E2988", employee["Employee Number"]);
				done();
			});
    })
  })


  describe('#findEmployeeById()', function(){
    it('should return a employee record for a given employeeId', function(done){
			var orgService = require('../services/OrganizationService');
      orgService.findEmployeeById("E517",function(err,employee){
				console.log("employee found: "+JSON.stringify(employee));
				assert.equal("E517", employee["Employee Number"]);
				done();
			});
    })
  })


  describe('#_findEmployeeByFirstLastName()', function(){
    it('should return a employee record for a given first and last name', function(done){
			var orgService = require('../services/OrganizationService');
      orgService.findEmployeeByFirstLastName("Christoph","Haas", function(err,employee){
				console.log("******************** employee found: "+employee);
				assert.equal("E8116", employee["Employee Number"]);
				done();
			});
    })
  })


	describe('#getEmployeesByTarget()', function(){
    it('should return per target the employees mapped to them', function(done){
			var orgService = require('../services/OrganizationService');

			var _mapping = [];
			_mapping.push({employeeId:"E2988",targets:["R1.1","G1.2"]})
			_mapping.push({employeeId:"E2987",targets:["R1.2","G1.2"]})

			/*
				{"R1.1":["E2988"]},
				{"R1.2":["E2987"]},
				{"G1.2":["E2988","E2987"]},
			*/


			orgService.getEmployeesByTargets(_mapping,null,null,null,function(err,result){
				logger.debug("**");
				logger.debug("++++++++++++++++ : "+result["G1.2"]);

				/*
				assert.equal("E2988", result["R1.1"][0]);
				assert.equal("E2987", result["R1.2"][0]);
				assert.equal("E2988", result["G1.2"][0]);
				assert.equal("E2987", result["G1.2"][1]);
*/

				done();
			});
    })
  })

  describe('#findEmployeesByFilter(filter)', function(){
    it('should return employees record for a given filter', function(done){
			var orgService = require('../services/OrganizationService');
      orgService.findEmployeesByFilter({"Cost Centre":"Studios Commercial Management"},function(err,employees){

				console.log("employees found: "+employees.length);
				//assert.equal("E2988", employee["Employee Number"]);
				done();
			});
    })
  })

  describe('#_getTarget2EmployeeMappingByL2Target(L2TargetId)', function(){
    it('should return employees records for a given L2TargetId', function(done){
			var L2TargetId = "G1.1";

			var orgService = require('../services/OrganizationService');
      orgService.getTarget2EmployeeMappingByL2Target(L2TargetId,function(err,employees){

				console.log("employees found for target: "+L2TargetId+": "+employees.length);
				//assert.equal("E2988", employee["Employee Number"]);
				done();
			});
    })
  })


	describe('#_getOrgTrend', function(){
		it('should return trend data how org evolves over history', function(done){
			this.timeout(30000);

			var orgService = require('../services/OrganizationService');
			orgService.getOrganizationTrend({},function(err,trend){

				console.log(": "+trend.length);
				console.log(JSON.stringify(trend));

				//assert.equal("E2988", employee["Employee Number"]);
				done();
			});
		})
	})



})
