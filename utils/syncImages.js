/** script to do a batch sync of current organization employee images from intranet
* need to be called from /space directory like node ./utils/syncImage.js
* and copy to space /employees/folder
*/

  var fs = require('fs');
  var imgService = require('../services/ImageService');
    fs.mkdir("temp/imagesync",  function(err) {
        if (err) {
            if (err.code == 'EEXIST') console.log("EEXISTS ok"); // ignore the error if the folder already exists
            else console.log("...something else went wrong: "+err.message); // something else went wrong
        } else{
          imgService.syncEmployeeImages({},function(err,result){
      		    console.log("---: "+ result);
          });
        }
	});
