var express = require('express');

var router = express.Router();

var mongo = require('mongodb');
var mongojs = require('mongojs');

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var config = require('config');


var logger = require('winston');

//logger.add(logger.transports.File, { filename: 'logs/s2t_upload.log' });
logger.level='debug';

logger.debug("***************************");


// fileupload + xls2json handling
var multer  = require('multer');


var baseUrl;

logger.debug("*********?????????");


module.exports = router;

// => has to be moved out of app.js !!!!!!!!!!!!!
router.use(multer({ dest: __dirname+'/temp_uploads/',

	rename: function (fieldname, filename) {
		return filename+Date.now();
	  },
	  
	  onError:function(error,next){
		  logger.debug("***************SHIT ERROR HAPPENED" +err);
	  },

	onFileUploadStart: function (file) {
	  logger.debug(file.originalname + ' is starting ...')
	},
	onParseEnd: function (req, next) {
		logger.debug('Form parsing completed at: ', new Date());
		
		// get the base URL of running app 
		baseUrl = req.getBaseUrl();
	  
		// call the next middleware
		next();
	},

	onFileUploadComplete: function (file) {
		logger.debug(file.fieldname + ' uploaded to  ' + file.path)
		done=true;
		var _filename = file.originalname;
		logger.debug("+++++++++++++++++ [OK] our original filename is: "+_filename);



		// upload done
		



	}
}));





router.get('/', function(req, res) {
   if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}
    
    res.render('upload',{title:'upload'});
});


router.post('/process',function(req,res){
  if(done==true){
    //console.log(req.files);
    //res.end("File uploaded, converted to json and imported to mongoDB.collection(imported)");
    
    // [TODO]and put some message in the locals....
    //res.locals.message="[SUCCESS] File uploaded, converted to json and imported to mongoDB";
    //res.send({msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});
    
    logger.info("...........upload done: now we should process the shit ....");
    
    //res.redirect("/upload");//,{msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});
  }
  else{
	res.end("File upload failed ....");
  }
});
