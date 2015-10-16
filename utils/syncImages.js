/** script to do a batch sync of current organization employee images from intranet
* need to be called from /space directory like node ./utils/syncImage.js
* and copy to space /employees/folder
*/
  var imgService = require('../services/ImageService');
    imgService.syncEmployeeImages({},function(err,result){
		console.log("---: "+ result);
	});
