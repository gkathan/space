var config = require('config');

var fs = require('fs');

var stream = require('stream');

var PNG = require('pngjs').PNG;
var PNGImage = require('pngjs-image');


exports.squarifyAndCircleCrop = _squarifyAndCircleCrop;

/**
* clips (if not already) a square image
* and circle crops it
* and saves it as "source_circle.png"
*/
function _squarifyAndCircleCrop(source,target,callback) {
	var image = PNGImage.readImage(source, function () {
	    // Get width and height
	    var _w = image.getWidth();
	    var _h = image.getHeight();


			var _outCircle = target+"_circle.png";

			

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
	    })
	});

	callback(null,"OK");


}
