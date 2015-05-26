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
    it('should read L1 targets from DB', function(done){
      var targetService = require('../services/TargetService');
			targetService.getL1("bpty.studios",function(err,L1targets){
					console.log("--- test");
					console.log("L1targets: "+JSON.stringify(L1targets));
					done();
			})
			//assert.equal("E2988", employee.EmployeeNumbexr);
		});
  })


  describe('#getL2ById()', function(){
    it('should read L2 target by Id from DB', function(done){
      var targetService = require('../services/TargetService');
			targetService.getL2ById("bpty.studios","G1.1",function(err,L2Target){

					console.log("L2target: "+JSON.stringify(L2Target));
					assert.equal("G1.1", L2Target.id);
					done();
			})

		});
  })

})
