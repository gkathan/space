// i need to be called from /space directory like node ./utils/syncImage.js
// first run this and then run node utils/circlecropper.js to crop the result of this
// and copy to space /employees/folder
// additionaly copy overrides manually


  var syncService = require('../services/OrganizationSyncService');

    syncService.syncEmployeeImages({},function(err,result){

		console.log("---: "+ result);
	});
