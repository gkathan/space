// i need to be called from /space directory like node ./utils/syncImage.js

  var syncService = require('../services/OrganizationSyncService');

    syncService.syncEmployeeImages({},function(err,result){

		console.log("---: "+ result);
	});
