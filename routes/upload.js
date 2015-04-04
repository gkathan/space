var express = require('express');
var router = express.Router();
var _ = require('lodash');
var config = require('config');

var winston=require('winston');
var logger = winston.loggers.get('space_log');
// fileupload + xls2json handling
var multer  = require('multer');
var baseUrl;
var appRoot = require('app-root-path');

module.exports = router;

router.use(multer({ dest: appRoot+'/temp/',
	rename: function (fieldname, filename) {
		return filename;//+Date.now();
	  },
	  onError:function(error,next){
		  logger.error("***************SHIT ERROR HAPPENED" +err);
	  },
	onFileUploadStart: function (file) {
	  logger.debug("....and here we check some stuff...");
		logger.debug(file.originalname + ' is starting ...');

		logger.debug("mimetype: " + file.mimetype);
		logger.debug("extension: " + file.extension);
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
		//done=true;
		var _filename = file.originalname;
		logger.debug("+++++++++++++++++ [OK] our original filename is: "+_filename);
	}
}));





router.get('/xlsx/plain', function(req, res) {
   if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}

    res.render('upload/plain',{title:'upload plain .xlsx'});
});

router.get('/xlsx/pi', function(req, res) {
   if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}

    res.render('upload/pi',{title:'upload pi .xlsx'});
});

router.get('/xlsx/portfolio', function(req, res) {
   if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}

    res.render('upload/portfolio',{title:'upload portfolio .xlsx'});
});

router.get('/firereport', function(req, res) {
   if (!req.session.AUTH){
		req.session.ORIGINAL_URL = req.originalUrl;
		res.redirect("/login");
	}

    res.render('upload/firereport',{title:'upload firereport .pdf'});
});



router.post('/process/xlsx',function(req,res){
   var _type = req.query.type;
    console.log("**************************************** req.query.type: "+_type);
    console.log("**************************************** req.originalUrl: "+req.originalUrl);

  if(req.files){

    debugger;
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

  if (_filename==undefined){
		res.locals.success=false;
		logger.debug("no filename: sending back...");
		res.locals.message="[s p a c e] says: come on - you should pick a file to upload ;-)";
    res.render("upload/"+_type, { title: 's p a c e - import' });
		return;
	}

	if (_.last(_filename.split("."))!="xlsx"){
		res.locals.success=false;
		logger.debug("no xlsx file ....");
		res.locals.message="[s p a c e] says: "+_filename+" seems not to be a valid .xlsx file...";
		res.render("upload/"+_type, { title: 's p a c e - import' });
		return;
	}


  // lets take the first
  // and do the json
  var xlsximport = require('../services/XlsxImportService');
  xlsximport.convertXlsx2Json(_filename,function(err,success){
		  if(success){
				res.locals.success=success;
		    res.locals.uploadfilename= _filename;
		    res.render("upload/"+_type, { title: 's p a c e - import '+_type });
			}
			else{
				res.locals.success=false;
		    res.locals.message= "[s p a c e] says: no way....."+err;
		    res.render("upload/"+_type, { title: 's p a c e - import '+_type });

			}
	});


  }
  else{
	 res.redirect("/upload/"+_type);//,{msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});

  }
});



router.post('/process/firereport',function(req,res){
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
		logger.debug("_filename: "+_filename)
    // lets take the first
    // and do the json
    if (_filename==undefined){
			res.locals.success=false;
			logger.debug("no filename: sending back...");
			res.locals.message="[s p a c e] says: come on ! - you should pick a valid firereport file to upload ;-)";
      res.render("upload/firereport", { title: 's p a c e - import' });
			return;
		}
		if (_.last(_filename.split("."))!="pdf"){
			res.locals.success=false;
			logger.debug("no pdf file ....");
			res.locals.message="[s p a c e] says: "+_filename+" seems not to be a valid .pdf firereport file...";
			res.render("upload/firereport", { title: 's p a c e - import' });
			return;
		}
		var pdfimport = require('../services/PdfImportService');
    pdfimport.store(_filename,"firereports");

    res.locals.success=true;
    res.locals.uploadfilename= _filename;
    res.render("upload/firereport", { title: 's p a c e - import' });
  }
  else{
	 res.redirect("/upload/firereport");//,{msg:"[SUCCESS] File uploaded, converted to json and imported to mongoDB"});

  }
});
