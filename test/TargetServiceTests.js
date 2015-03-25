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



describe('TargetService', function(){
  describe('#getL1()', function(){
    it('should read L1 targets from DB', function(){

      var targetService = require('../services/TargetService');

			targetService.getL1(function(L1targets){
					console.log("--- test");
					console.log("L1targets: "+JSON.stringify(L1targets));
			})

			//assert.equal("E2988", employee.EmployeeNumbexr);

		});



    })

})
