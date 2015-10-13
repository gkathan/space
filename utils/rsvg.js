	var Rsvg = require('rsvg').Rsvg;
var fs = require('fs');
//style="stroke:#ff0000; fill: #0000ff"

var _css = ".test{stroke:#ff0000; fill: grey}";

data ='<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <style type="text/css"> <![CDATA['+_css+']]> </style> <rect class="test" x="10" y="10" height="100" width="100" /></svg>';

// Create SVG render instance.
var svg = new Rsvg();

// When finishing reading SVG, render and save as PNG image.
svg.on('finish', function() {
  console.log('SVG width: ' + svg.width);
  console.log('SVG height: ' + svg.height);
  fs.writeFile('test4.pdf', svg.render({
    format: 'pdf',
    width: 4000,
    height: 4000
  }).data,function(err,done){
    console.log("....done");
  });
});

// Stream SVG file into render instance.
fs.createReadStream('test4.svg').pipe(svg);
