var express = require('express');

var router = express.Router();

var mongo = require('mongodb');
var mongojs = require('mongojs');


var _ = require('lodash');

var config = require('config');


var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize:true, prettyPrint:true,showLevel:true,timestamp:true}),
      new (winston.transports.File)({ filename: 'logs/s2t_upload.log' , prettyPrint:true,showLevel:true})
    ]
  });
logger.level='debug';


// fileupload + xls2json handling
var multer  = require('multer');


var baseUrl;

var appRoot = require('app-root-path');


module.exports = router;

// => has to be moved out of app.js !!!!!!!!!!!!!
router.use(multer({ dest: appRoot+'/temp/',

	rename: function (fieldname, filename) {
		return filename;//+Date.now();
	  },
	  
	  onError:function(error,next){
		  console.log("***************SHIT ERROR HAPPENED" +err);
	  },

	onFileUploadStart: function (file) {
	  console.log(file.originalname + ' is starting ...')
	},
	onParseEnd: function (req, next) {
		console.log('Form parsing completed at: ', new Date());
		
		// get the base URL of running app 
		baseUrl = req.getBaseUrl();
	  
		// call the next middleware
		next();
	},

	onFileUploadComplete: function (file) {
		console.log(file.fieldname + ' uploaded to  ' + file.path)
		//done=true;
		var _filename = file.originalname;
		console.log("+++++++++++++++++ [OK] our original filename is: "+_filename);
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
  if(req.files){
    
    
    logger.debug(req.files);
    
    // [TODO]and put some message in the locals....
    //res.locals.message="[SUCCESS] File uploaded, converted to json and imported to mongoDB";
    //res.send({msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});
    logger.info("...........upload done: now we should process the shit ....: "+req.files);
    
    var _filename;
    
    for (var f in req.files){
		_filename = req.files[f].name;
		logger.info("  ** file: : "+_filename);
	}
    
    // lets take the first 
    // and do the json 
    var xlsximport = require('../services/XlsxImportService');
    xlsximport.convertXlsx2Json(_filename);
    
    res.locals.success=true;
    res.locals.uploadfilename= _filename;
    res.render("upload");
  }
  else{
	 res.redirect("/upload");//,{msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});
	
  }
});
