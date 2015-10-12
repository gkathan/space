/**
 * shared org functions
 * used by org.html, org_tree.html, org_radial.html
 *
 */
function getSize(data,tresholdMax,tresholdMin){
	if (!tresholdMax) tresholdMax = 30;
	if (!tresholdMin) tresholdMin = 4;

	var _size=data.overallReports?(Math.sqrt(data.overallReports)):tresholdMin;
		  if (_size>tresholdMax) _size = tresholdMax;
		  if (_size<tresholdMin) _size = tresholdMin;

	//if (data.depth &&data.depth<=4 && data.depth>=3) _size = _size*((4-data.depth));
	return _size;
}


function show(data){
	for (var i in data){
		var _text = "";
		_text+="name: "+data[i].name;
		if (data[i].children) _text+=" members: "+data[i].children.length;
		console.log(_text);
	}
}
