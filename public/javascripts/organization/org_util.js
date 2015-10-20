/**
 * shared org functions
 * used by org.html, org_tree.html, org_radial.html
 *
 */
function getSize(data,tresholdMax,tresholdMin,maxDepth){
	if (!tresholdMax) tresholdMax = 20;
	if (!tresholdMin) tresholdMin = 5;
	if (!maxDepth) maxDepth = 3;

	var _level =data.level;


	//var _size=data.overallReports?(Math.sqrt(data.overallReports)):tresholdMin;
	var _size=10-data.depth
		  if (_size>tresholdMax) _size = tresholdMax;
		  if (_size<tresholdMin) _size = tresholdMin;

	//if (data.depth &&data.depth<=4 && data.depth>=3) _size = _size*((4-data.depth));
	//if (!data.children)
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
