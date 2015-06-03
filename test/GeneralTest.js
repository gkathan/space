var winston = require('winston');
var _ = require('lodash');

var mongojs = require("mongojs");
var DB="space";
var connection_string = '127.0.0.1:27017/'+DB;
var db = mongojs(connection_string, [DB]);


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


describe('General stuff', function(){
  describe('#constructing a formated object()', function(){
    it('should return a formatted string from a given object', function(done){
			var change = [
        {
            "id" : "INC122470",
            "sysId" : "f29c519d0ffbb9003e89fe6362050ebf",
            "diff" : {
                "closeCode" : [
                    null,
                    "Solved (permanently)"
                ],
                "environment" : [
                    null,
                    "BPTY Live"
                ],
                "state" : [
                    "Awaiting",
                    "Resolved"
                ],
                "slaBreach" : [
                    "",
                    false
                ],
                "subCategory" : [
                    null,
                    "Content & Website"
                ],
                "timeToResolve" : [
                    "312:01:16"
                ]
            }
        }
    ];
		var _body ="";
		for (var i in _.keys(change[0].diff)){
			var _key = _.keys(change[0].diff)[i];
			console.log("_key: "+_key);
			_body+="\n"+_key+" : "+change[0].diff[_key][0]+" -> "+change[0].diff[_key][1];
		}
		console.log("change.diff: "+change[0].diff);
		console.log("body: "+_body);
		assert.equal("Resolved", change[0].diff.state[1]);
		done();
	})
})


  describe('#updating mongodb records', function(){
    it('test how to update existing records', function(done){

		var collection = db.collection('__test');

		//var item = {id:"inc0001",name:"ubba",value:100,date:new Date()};
		//collection.insert(item,function(err,result){
			collection.find(function(err,data){
					console.log("data: "+JSON.stringify(data));

					var _updatedItem = {id:"inc0001",name:"ubba",value:200,date:new Date()};
					_updatedItem._id = data[0]._id;
					var result = collection.save(_updatedItem,function(err,result){
						console.log("result: "+JSON.stringify(result));
						done();

					});
			})
		//});

		})
	})



})
