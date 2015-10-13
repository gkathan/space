var lwip = require('lwip');
var stream = require('stream');

var PNG = require('pngjs').PNG;

var _url ="../temp/E2873"


_openFile(_url,function(err,buffer){
  console.log("1) loaded file: "+_url+" into buffer...");
  var _type;
  _type = _getType(buffer);
  console.log("2) detect type: "+_type);

  //lwip needs to know the type
  lwip.open(buffer,_type,function(err,image){
    var _w = image.width();
    var _h = image.height();
    console.log("3) lwip loaded buffer: "+_url+" width: "+_w+" - height: "+_h);

    var _cropSize = 100;
    image.crop(_cropSize,_cropSize,function(err,image){
      image.toBuffer("png",{},function(err,buffer){
        console.log("4) lwip writes into PNG buffer...");





      })
    })
  })


});





function _openFile(_url,callback){
  var fs = require("fs");
  fs.readFile(_url, function (err, buffer) {
    if (err) throw err;
    callback(err,buffer);
  });
}


function _getType(buffer){
  var magic = {
      jpg: 'ffd8ffe0',
      png: '89504e47',
      gif: '47494638'
  };

  var _check =buffer.toString('hex',0,4);
  if (_check == magic.jpg) return "jpg";
  else if (_check == magic.png) return "png";
  else if (_check == magic.gif) return "gif";
}
