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
var _ = require("lodash");

var userService = require('../services/UserService');


describe('UserService', function(){
  describe('#findUser()', function(){
    it('should find a user by username', function(done){
      var _username = "admin";
			var _password = "4dm1N_";

			userService.authenticate(_username,_password,function(err,user){
					console.log("--- user: "+JSON.stringify(user));
					assert.equal("admin", user.role);
					done();
			})

		});
  })



})
