/**
 * shared org functions
 * used by org.html, org_tree.html, org_radial.html
 *
 */
function getSize(data,tresholdMax,tresholdMin,maxDepth){
	if (!tresholdMax) tresholdMax = 20;
	if (!tresholdMin) tresholdMin = 6;
	if (!maxDepth) maxDepth = 3;

	var _level =data.level;


	//var _size=data.overallReports?(Math.sqrt(data.overallReports)):tresholdMin;
	var _size=10-data.depth
		  if (_size>tresholdMax) _size = tresholdMax;
		  if (_size<tresholdMin) _size = tresholdMin;

	//if (data.depth &&data.depth<=4 && data.depth>=3) _size = _size*((4-data.depth));
	if (!data.children)
		_size=tresholdMin;
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


/**
 * recursive search by name and value
 * and returns the match as new root
 */
function searchTreeBy(node,searchName,searchValue){
  	var children = node.children;
  	if (children){
  		for (var i in children){
        if (children[i][searchName] == searchValue){
          return children[i];
        }
        else{
          var found = searchTreeBy(children[i],searchName,searchValue);
          if (found){
             //console.log("xxxxxx");
             return found;
          }
        }
  		}
  	}
    else{
      return;
    }
}

/**
checks whether parameter is a name (first name, last name) or an E1234 id
*/
function checkId(name){
	var _split = name.split("E");
	if (_split.length>1){
		if (_.isNumber(parseInt(_split[1]))) return true;
	}
	return false;
}
