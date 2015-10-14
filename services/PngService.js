var config = require('config');

var fs = require('fs');

var stream = require('stream');

var PNG = require('pngjs').PNG;
var PNGImage = require('pngjs-image');


// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.squarifyAndCircleCrop = _squarifyAndCircleCrop;
exports.detectType = _detectType;

/**
* clips (if not already) a square image
* and circle crops it
* and saves it as "source.png"
*/
function _squarifyAndCircleCrop(source,callback) {
	PNGImage.readImage(source, function (err,image) {
			if (err){
				logger.debug("Error: "+err.message);
			}
			else if (image){

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
	    png: '89504e47',
	    gif: '47494638'
	};

	var type;

  var magigNumberInBody = buffer.toString('hex',0,4);
	if (magigNumberInBody == magic.jpg) type ="jpg";
	else if (magigNumberInBody == magic.png) type ="png";
	else if (magigNumberInBody == magic.gif) type="gif";
  return type;

}
