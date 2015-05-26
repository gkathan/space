var config = require('config');

var fs = require('fs');
var FileQueue = require('filequeue');
var fq = new FileQueue(100);

var stream = require('stream');

var PNG = require('pngjs').PNG;
var PNGImage = require('pngjs-image');
var lwip = require('lwip');

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.circleCrop = _circleCrop;
exports.detectType = _detectType;
exports.convertToSquarePng = _convertToSquarePng;

/**
*
scales down to normalized size
converts to PNG
*/
function _convertToSquarePng(_source,size,callback){
	_openFile(_source,function(err,buffer){
	  logger.debug("1) loaded file: "+_source+" into buffer...");
	  var _type;
	  _type = _detectType(buffer);
	  logger.debug("2) detect type: "+_type);

	  //lwip needs to know the type
	  lwip.open(buffer,_type,function(err,image){
	    var _w = image.width();
	    var _h = image.height();
	    logger.debug("3) lwip loaded buffer: "+_source+" width: "+_w+" - height: "+_h);

			//image.resize(width, height, inter, callback)
			//resize image down to width =100
			// width =800 => ratio = 8
			var _ratio = _w/size;

			image.resize(_w/_ratio,_h/_ratio,"lanczos",function(err,image){
				logger.debug("4) lwip images resize: [OK] width: "+(_w/_ratio)+" height: "+_h/_ratio);
		    var _cropSize = size;
		    image.crop(_cropSize,_cropSize,function(err,image){
		      if (err){
							logger.error("5) lwip image crop: [FAILED] "+err.message);
					}
					logger.debug("5) lwip image crop: [OK] "+_cropSize+" cropSize");
					//image.toBuffer("png",{},function(err,buffer){

					image.writeFile(_source+"_square.png","png",{},function(err,buffer){
		        logger.debug("6) lwip writes PNG file..."+_source+"_square.png");
						callback(err,"OK");
		      })
		    })
	  	})
	  })
	});
}

/**
* clips (if not already) a square image
* and circle crops it
* and saves it as "source_circle.png"
*/
function _circleCrop(source,callback) {

	PNGImage.readImage(source, function (err,image) {
			if (err){
				logger.debug("Error: "+err.message);
			}
			else if (image){
				logger.debug("+++++ IMAGE read [OK] _circleCrop for: "+source);
				/*
				// Get width and height
		    var _w = image.getWidth();
		    var _h = image.getHeight();
				var _outCircle = source+"_circle";
		    // clipping diff from top and bottom if source is not square format
		    var _diff = 0;
		    var _clipX = 0;
		    var _clipY = 0;

		    if (_h > _w){
		      _diff=(_h-_w)/2;
		      _clipY = _diff;
		    }
		    else if (_h < _w){
		      _diff=(_w-_h)/2;
		      _clipX = _diff;
		    }
		    image.clip(_clipX, _clipY, _w, _w);
				*/

				var _outCircle = source+"_circle";


				image.toBlob( function(err,blob){
		      //  circle crop
					var _type = _detectType(blob);
					logger.debug("------------------------- type: "+_type);
					if (_type=="png"){
						var bufferStream = new stream.PassThrough();
						bufferStream.end( blob );
						bufferStream
			        .pipe(new PNG({
			            filterType: 4
			        }))
			        .on('parsed', function() {
			        for (var y = 0; y < this.height; y++) {
			          for (var x = 0; x < this.width; x++) {
			            var idx = (this.width * y + x) << 2;
			            var radius = this.width / 2;
			            if(y >= Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2)) + radius || y <= -(Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2))) + radius) {
			                this.data[idx + 3] = 0;
			            }
			          }
			        }
			        this.pack().pipe(fs.createWriteStream(__dirname + "/../"+_outCircle));
			      });
					} //end if (type=="png")
		    })
			callback(null,"OK");
			} // end if (image)
			else{
				callback(null,"source: "+source+ "NOT OK");
			}
	});
}

/**
* thanks to http://stackoverflow.com/questions/8473703/in-node-js-given-a-url-how-do-i-check-whether-its-a-jpg-png-gif
*/
function _detectType(buffer){
	var magic = {
	    jpg: 'ffd8ffe0',
			jpg2: 'ffd8ffe1',

	    png: '89504e47',
	    gif: '47494638'
	};
	console.log("magic byte: "+buffer.toString('hex',0,4));
  var magigNumberInBody = buffer.toString('hex',0,4);
	if (magigNumberInBody == magic.jpg || magigNumberInBody == magic.jpg2) type ="jpg";
	else if (magigNumberInBody == magic.png) type ="png";
	else if (magigNumberInBody == magic.gif) type="gif";

	return type;
}


function _openFile(_url,callback){

  fs.readFile(_url, function (err, buffer) {
    logger.debug("trying to open file: "+_url);
		if (err){
			logger.error(err.message);
			throw err;
		}
    callback(err,buffer);
  });
}
