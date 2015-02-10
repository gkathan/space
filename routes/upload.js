var express = require('express');

var router = express.Router();

var mongo = require('mongodb');
var mongojs = require('mongojs');

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
//u.nst = require('underscore.nest');


// fileupload + xls2json handling
var multer  = require('multer');
var xlsx_json = require('xlsx-to-json')


module.exports = router;

// => has to be moved out of app.js !!!!!!!!!!!!!
router.use(multer({ dest: __dirname+'/temp_uploads/',

	rename: function (fieldname, filename) {
		return filename+Date.now();
	  },

	onFileUploadStart: function (file) {
	  console.log(file.originalname + ' is starting ...')
	},

	onFileUploadComplete: function (file) {
	  console.log(file.fieldname + ' uploaded to  ' + file.path)
	  
	  done=true;
	  
	  var _filename = file.originalname;
	  console.log("+++++++++++++++++ [OK] our original filename is: "+_filename);
	  
	  
	  // here we can do our processing
	  var _originalFilename = file.originalname;
	  var _jsonfilename = file.name+".json";
	  var _outputFile =  __dirname + '/temp_uploads/'+_jsonfilename;
	  
	  console.log("******************** output: "+_outputFile);
	  //1) convert xlsx2json
	  
		xlsx_json({
		  input: file.path,
		  output: _outputFile
		}, function(err, result) {
		  if(err) {
			console.error(err);
		  }else {
			//console.log(result);
			fs.readFile(_outputFile, 'utf8', function (err, data) {
			if (err) throw err; // we'll not consider error handling for now
			var json = JSON.parse(data);
			//console.log("parsed "+_jsonfilename+": "+json);
			console.log("***and inserting into mongoDB...");
			
			
			console.log("***************** [DEBUG]: _originalFilename: "+_originalFilename);
			
			
			var _check = _validateName(_originalFilename);
			var _collection = _check.collection;
			var _date = _check.date;
			var _boarddate = _check.boarddate;
			
			var _fillblanks = _check.fillblanks;
			
			
			var _function ="";
			var _dropBeforeInsert=false;
			
			if (_collection=="portfoliogate") _function = _handlePortfolioGate;
			else if (_collection=="org") _function = _handleHR_PI;
			else if (_collection=="productportfolio" || _collection=="productcatalog" || _collection=="targets" || _collection=="incidents"){
				 _function = _handlePlain;
				 _dropBeforeInsert = true;
			}
			
			console.log("***************** [DEBUG]: _collection: "+_collection+" _date: "+_date);
			
			
			if (_date){
				var _data = _function(json,_date,_boarddate,_fillblanks);
				
				console.log("...going to store to mongoDB: collection = "+_collection+" data:"+_data );
				
				var DB="kanbanv2";
				var connection_string = '127.0.0.1:27017/'+DB;
				var db = mongojs(connection_string, [DB]);
				
				// in some cases it would be needed to drop old collection first
				if (_dropBeforeInsert) db.collection(_collection).drop();
				
				db.collection(_collection).insert(_data);
				done=true;
			}
			
			else{
				console.log("NONO - wrong file and name!!!");
				done = false;
			}
			
			});
		  }
		});
}
}));

/**
 * checks format for portfoliogate xlsx upload
 * must be: <collectionname>_<year>-<month>-<day>.xlsx
 * optional is a third element to indicate to fillblanks
 * <collectionname>_<year>-<month>-<day>_fillblanks.xlsx
 * example portfoliogate_2015-01-28.xlsx
 */
function _validateName(fileName){
	
	console.log("[DEBUG] validateName(filename): "+fileName);
	var _parts=_.first(fileName.split('.')).split('_');
	//if (_parts[0]!="portfoliogate") return false;
	
	var _date = new Date(_parts[1]);
	if ( Object.prototype.toString.call(_date) !== "[object Date]" ) return false;

	var _boarddate = new Date(_parts[2]);
	if ( Object.prototype.toString.call(_boarddate) !== "[object Date]" ) return false;

	
	if (_parts[3]=="fillblanks"){
		return {"collection":_parts[0],"date":_parts[1],"boarddate":_parts[2],"fillblanks":true};
	}
	else {
		
		return {"collection":_parts[0],"date":_parts[1],"boarddate":_parts[2],"fillblanks":false};
	}
	
	
}


/** takes a json object and does some processing before it gets stored
 */
function _handlePortfolioGate(json,date,boarddate){
	//group by Date
	console.log("######################## _handlePortfolioGate called with date: "+date);
	
	var map = _clusterBy(json,"pDate",date,"pItems");
	
	
	var map2 = new Object();
	
	
	for(i =0 ; i < map.pItems.length; i++){
		var key = map.pItems[i].Status;
		if(!map2[key]){
		   var array = new Array();        
			map2[key] = array;
		}
		map2[key].push(map.pItems[i]);
	}
	map.pItems=map2;
	map.pBoardDate = boarddate;
			
	return map;
			
}

function _handleHR_PI(json,date){
	//group by Date
	console.log("######################## _handleHR_PI called with date: "+date);
	
	
	var map = _clusterBy(json,"oDate",date,"oItems");
	
			
	return map;
			
}

/**
 * helper to cluster an array by a certain field
 */
function _clusterBy(inArray,clusterName,clusterValue,itemBucket){
	var map = new Object();
	for(i =0 ; i < inArray.length; i++){
		
		var key = clusterValue;
		//console.log("key:"+key);
		if (!map[clusterName]) map[clusterName]=key;
		if(map[clusterName]==key){
		   //console.log("****"+key);
			if (!map[itemBucket]) map[itemBucket] = new Array();
		}
		map[itemBucket][i]=(inArray[i]);
		//console.log("****"+json[i]);
	}
	return map;
	
}


/** takes a json object and does some processing before it gets stored
 */
function _handlePlain(json,date,fillblanks){
	//group by Date
	console.log("######################## _handlePlain called with date: "+date);
	
	// and fill blank cells 
	// _length = number of rows
	
	
	if (fillblanks){
	
		var _rows = json.length;
		for (var row=0; row<_rows; row++){
			//console.log(orgData[i]);
			var _column=1;
			var _keys = Object.keys(json[row]);
			
			// !!!!!!!!!!!!! NEEDS some REFACTORING as it always fills up blanks now !!!!
			// also when i do NOT want it ;-)
			for (var key in json[row]){
				if (json[row-1]){
					/*
					console.log("* row..."+row);
					console.log("* column..."+_column);
					console.log("** number of rows: "+json.length);
					console.log("** number of columns: "+_keys.length);
					console.log("** column: "+key);
					console.log("*** value: "+json[row][key]);
					
					 
					
					var _x1_prev = json[row-1][_keys[_column]];
					var _x2 = json[row-1][_keys[_column-1]];
					var _x3 = json[row][_keys[_column-1]];
					
					console.log("_x1 = "+_x1);
					console.log("_x2 = "+_x2);
					console.log("_x3 = "+_x3);
					*/
					
					var _x1_prev = json[row-1][_keys[_column]];
					var _x1 = json[row][_keys[_column]];if (!_x1 && _x1_prev) {
						json[row][_keys[_column]] = _x1_prev;
					} 
					
				}
			_column++;
			}
			
		}
	}
	
	return json;
			
}





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
    res.locals.message="[SUCCESS] File uploaded, converted to json and imported to mongoDB";
    res.render("upload");
  }
  else{
	res.end("File upload failed ....");
  }
});
