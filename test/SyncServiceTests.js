var winston = require('winston');
var _ = require('lodash');
var config = require('config');

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


describe('SyncServices', function(){
  describe('getLastSync', function(){
    it('should return last sync info for given syncName', function(done){

      var syncService = require('../services/SyncService');

			syncService.getLastSync("soc_outages",function(err,result){
					logger.debug("Outages : "+JSON.stringify(result));
					assert.equal("soc_outages", result.name);
					done();
			})

		});
	});

  describe('getLastSyncs', function(){
    it('should return last syncs info for given syncNames', function(done){

      var syncService = require('../services/SyncService');

			var _syncers=[];

			_syncers.push({name:"soc_outages",sync:config.sync.soc_outages});
			_syncers.push({name:"soc_services",sync:config.sync.soc_services});

			logger.debug("_syncers: "+JSON.stringify(_syncers));

			syncService.getLastSyncs(_syncers,function(err,result){
				logger.debug("LastSyncs : "+JSON.stringify(result));
				assert.equal(2, result.length);
				assert.equal("soc_outages",_.findWhere(result,{"name":"soc_outages"}).name);
				done();
			})

		});
	});


})
