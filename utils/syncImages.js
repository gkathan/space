/** script to do a batch sync of current organization employee images from intranet
* need to be called from /space directory like node ./utils/syncImage.js
* and copy to space /employees/folder
*/

  var _dir = "temp/imagesync";

  var fs = require('fs');
  var imgService = require('../services/ImageService');
  if( fs.existsSync(_dir)){
    deleteFolderRecursive(_dir);
  }

    fs.mkdir(_dir,  function(err) {
        if (err) {
            if (err.code == 'EEXIST') console.log("EEXISTS ok"); // ignore the error if the folder already exists
            else console.log("...something else went wrong: "+err.message); // something else went wrong
        } else{
          imgService.syncEmployeeImages({},function(err,result){
      		    console.log("---: "+ result);
              process.exit();
          });
        }
	});


function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
