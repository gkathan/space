/** kanban_utils
 * extracted kanban_core stuff (hierarchy calculation...)
 * NG version, branched off for express nodejs version
 * depends on:
 * @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */



/** config (former override)
 *
 */
function getConfigByLevel(level){
		for (var i in itemDataConfig){
			if (itemDataConfig[i].level==level) return itemDataConfig[i];
		}
	return null;
}


/** helper function to return array element of  json structure by specified name
 */
function _getDataBy(name,value,data){
	for (var i in data){
		if (data[i][name]==value) return data[i];
	}
}


function getConfigModeByLevel(level){
	_config = getConfigByLevel(level);
	if (_config) return _config.mode;
	return null;
}

function getConfigByName(name){
	var _config = [];
	for (var i in itemDataConfig){
		if (itemDataConfig[i].name==name ||itemDataConfig[i].name=="*") _config.push(itemDataConfig[i]);
	}
	return _config;
}

/**
calculates the offset to center elements / text per sublane
*/
function getSublaneCenterOffset(sublane,maxDepth){
	if(sublane){
		var _sublane = getSublaneByNameNEW(sublane,maxDepth);
		if (_sublane){
			var _height = _sublane.yt2-_sublane.yt1;
			return -(_height/2);
		}
	}
}



function getItemByKey(data,key,value){
	if (!data) return;
	for (var _item=0; _item< data.length;_item++){
			if (data[_item][key] == value){
				return data[_item];
			}
	}
}

/**
* helper method to get item from object array by ID
*/
function getItemByID(data,id){
	if (!data) return;
	for (var _item=0; _item< data.length;_item++){
			if (data[_item].id == id){
				return data[_item];
			}
	}
}

function getItemsBySublane(sublane,maxDepth){
	var _sub = getSublaneByNameNEW(sublane,maxDepth);
	if (_sub && _sub.children){
		return _sub.children;
	}
}



/** return object array of lanes
*/
function getLanesNEW(){
	return getElementsByDepth(2);
}

/** returns lane object by name
 */
function getLaneByNameNEW(name){
	var _lanes = getLanesNEW();
	//console.log("-----getLaneByName name: "+name);
	for (var i in _lanes){
		//console.log("------------ lanes.name: "+_lanes[i].name)
		if (_lanes[i].name===name) return _lanes[i];
	}
	return null;
}


/*
looks like this is more about the LEAF level = max depth
*/
function getSublanesNEW(lane,maxDepth){
	if (lane)
		return getLaneByNameNEW(lane).children;
	else{
			return getElementsByDepth(maxDepth);
	}
}

function getSublaneByNameNEW(name,maxDepth){
	var _sublanes = getSublanesNEW(null,maxDepth);
	for (var i in _sublanes){
		if (_sublanes[i].name===name) return _sublanes[i];
	}
	return null;
}

function getThemesNEW(){
	return getElementsByDepth(0);

}

function getElementsByDepth(depth){
	var _elements = [];
	traverse(itemTree,0,depth,_elements);
	return _elements;
}






/** start=0, stop=1 should give me the 2 top elements in hierarchy
 */
function traverse(_itemData,_start,_stop,_list){
	if (_itemData.children){
		_start++;
		for (var i in _itemData.children){
			if (_itemData.children[i].children && _stop >_start){
				traverse(_itemData.children[i],_start,_stop,_list);
			}
			else {
				// do whtever needs to be don on the stop-level
				// as an example just return the elements
				_list.push(_itemData.children[i]);
			}
		}
	}
	else{
		console.log("....no more children found..");
	}
}



/** Calculate the difference of two dates in total days
*/
function diffDays(d1, d2){
	date1_unixtime = parseInt(new Date(d1).getTime() / 1000);
	date2_unixtime = parseInt(new Date(d2).getTime() / 1000);

	// This is the calculated difference in seconds
	var timeDifference = date2_unixtime - date1_unixtime;

	// in Hours
	var timeDifferenceInHours = timeDifference / 60 / 60;

	// and finaly, in days :)
	var timeDifferenceInDays = timeDifferenceInHours  / 24;

	return timeDifferenceInDays;
}

/**
* helper methods
*/
function getInt(_value){
	var _int =0;
	if (parseInt(_value)) _int = parseInt(_value);
	return _int;
}

function timeFormat(formats) {
  return function(date) {
    var i = formats.length - 1, f = formats[i];
    while (!f[1](date)) f = formats[--i];
    return f[0](date);
  };
}

/** helper to return fully qualified (FQ) name over all nest levels
 */
function getFQName(d){
	if (d){

			return d.lanePath;
	}
}


// "NG" REFACTORING STARTED

/**
* taken from http://stackoverflow.com/questions/17140711/how-to-show-a-list-or-array-into-a-tree-structure-in-javascript
*
* path array has to have an item named path="/bb/aa/.."
*
*/
function buildTreeFromPathArray(paths){

	// needs to be called on the input string array
	//paths = paths.map(function(d) { return d.split('/'); });

	var items = [];
	for(var i = 0, l = paths.length; i < l; i++) {
		var path = paths[i];
		var name = path[0];
		var rest = path.slice(1);
		var item = null;
		for(var j = 0, m = items.length; j < m; j++) {
			if(items[j].name === name) {
				item = items[j];
				break;
			}
		}
		if(item === null) {
			item = {name: name, children: []};
			items.push(item);
		}
		if(rest.length > 0) {
			item.children.push(rest);
		}
	}


	for(var i = 0, l = items.length; i < l; i++) {
		item = items[i];
		item.children = buildTreeFromPathArray(item.children);
	}

	return items;
}






/* --------------------------------------------------------- auto layout section ------------------------------------------------------------*/

function printItems(items){
	for (var p=0;p<items.length;p++){
		console.log("* items["+p+"]: id: "+items[p].id+" planDate: "+items[p].planDate);
	}
}

/**
 * takes an array of items and splits it up in segmented arrays by same planDates (current impl)
 *
 */
function segmentItemsByDate(items){
	// first let's sort
	console.log("***before sort***");
	printItems(items);


	items.sort(function(a,b){return new Date(a.planDate).getTime()-new Date(b.planDate).getTime();})

	console.log("***after sort***");
	printItems(items);
	var _segments=new Array();
	var e=0;
	while(items.length>0){
		console.log("in outer loop - e: "+e);
		_segments[e] = new Array();

		for (var i=0 ;i<items.length;i++){
			//console.log("in inner loop - i: "+i+  " i.planDate: "+items[i].planDate+"(e: "+e+") e.planDate: "+items[e].planDate);
			if (items[0].planDate == items[i].planDate){
				console.log("***e: "+e+" i: "+i+" same planDate found");
				_segments[e].push(items[i]);
				console.log("+++++ pushed in _segments["+e+"] id: "+items[i].id);
			}
			console.log("e="+e);
		}
		for(var j in _segments[e]){
			printItems(items);
			console.log("elements.length: "+items.length);
			console.log("-> kicking out ["+j+"]: id: "+items[0].id);
			console.log("e="+e);
			items.splice(0,1);
		}
	e++;
	}
	console.log("...and now ? e="+e);


	return _segments;
}

/**
 * selects D3 SVG elements by item objects
 * */
function getElements(items){
		var _ids = new Array();

		var _elements = new Array();
		console.log("*** getElements() called for items.lenght:"+items.length);
		for (var i in items){
			_ids.push(items[i].id);
			_elements.push(d3.select("#item_"+items[i].id));
			console.log("************ in getElements(): pushing - id:"+items[i].id);

		}
		//var _ids=new Array(200,201,208,209)
		/*
		var _elements = d3.select("#items").selectAll("g").filter(function(d){return _ids.indexOf(d.id)>=0;});
		*/
		console.log("*** returning "+_elements.length+" elements");

		return _elements;
}


function autoLayout(){
	_lanes = getLanesNEW();
	for (l in _lanes){
		autoLayoutByLane(_lanes[l].name);
	}

}

function autoLayoutByLane(lane){
	_sublanes = getSublanesNEW(lane);
	for (s in _sublanes){
		autoLayoutBySublane(_sublanes[s].name);
	}
}

function autoLayoutBySublane(sublane){
	var _items = getItemsBySublane(sublane);
	var _segments = segmentItemsByDate(_items);

	var yBase=margin.top+y(getSublaneByNameNEW(sublane).yt1);

	for (var s in _segments){
		layout(getElements(_segments[s]),yBase);
	}
}

/**
 * layout core algorithm
 * uses _getMetrics function to get proper info about transformed svg elements (getBBox is not sufficient...)
 * @yBase the yt1 of lane context we are in
 */
function layout(elements,yBase){
	console.log("in layout()...yBase="+yBase);
	var _total =0;
	var _number = 0;

	// TODO: get the y1 of according lanecontext and start from top



	var _yList =new Array();

	for (var i in elements){
		if (elements[i].node()) {
			console.log("...layout get metrics of: "+elements[i]);
			var _m =get_metrics(elements[i].node());
			_total+=_m.height
			console.log("height: "+_m.height+" total:"+_total+" m.y: "+_m.y);
			_yList.push(_m.y);
			_number++;
		}
	}

	//var _ids = d3.select("#items").selectAll("g")[0];
	var _min = d3.min(_yList);
	var _height = _total/_number;
	console.log("top y: "+_min);
	console.log("number elements: "+_number);
	console.log("_total height: "+_total);

	var i=0;
	var _space =1;

	for (var e in elements){
		if (elements[e].node()) {
			var _m =get_metrics(elements[e].node());
			elements[e].attr("transform","translate(0,"+(yBase+i-_m.y)+")");
			i+=_m.height+_space;
		}
	}
}


// =================================== auto-layout END =====================================


function wrapText(caption,maxChars){
	if (!maxChars) maxChars = 20;

	var words = caption.split(" ");
	var line = "";

	var wrap = new Array();

	for (var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + " ";
		if (testLine.length > maxChars || words[n]=="|")
		{
			wrap.push(line);

			if (words[n]=="|") words[n]="";

			line = words[n] + " ";
		}
		else {
			line = testLine;
		}
	}
	wrap.push(line);
	return wrap;
}



/**
http://stackoverflow.com/questions/13046811/how-to-determine-size-of-raphael-object-after-scaling-rotating-it/13111598#13111598
*/
function get_metrics(el) {
    function pointToLineDist(A, B, P) {
        var nL = Math.sqrt((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
        return Math.abs((P.x - A.x) * (B.y - A.y) - (P.y - A.y) * (B.x - A.x)) / nL;
    }

    function dist(point1, point2) {
        var xs = 0,
            ys = 0;
        xs = point2.x - point1.x;
        xs = xs * xs;
        ys = point2.y - point1.y;
        ys = ys * ys;
        return Math.sqrt(xs + ys);
    }
    var b = el.getBBox(),
        objDOM = el,
        svgDOM = objDOM.ownerSVGElement;
    // Get the local to global matrix
    var matrix = svgDOM.getTransformToElement(objDOM).inverse(),
        oldp = [[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]],
        pt, newp = [],
        obj = {},
        i, pos = Number.POSITIVE_INFINITY,
        neg = Number.NEGATIVE_INFINITY,
        minX = pos,
        minY = pos,
        maxX = neg,
        maxY = neg;

    for (i = 0; i < 4; i++) {
        pt = svgDOM.createSVGPoint();
        pt.x = oldp[i][0];
        pt.y = oldp[i][1];
        newp[i] = pt.matrixTransform(matrix);
        if (newp[i].x < minX) minX = newp[i].x;
        if (newp[i].y < minY) minY = newp[i].y;
        if (newp[i].x > maxX) maxX = newp[i].x;
        if (newp[i].y > maxY) maxY = newp[i].y;
    }
    // The next refers to the transformed object itself, not bbox
    // newp[0] - newp[3] are the transformed object's corner
    // points in clockwise order starting from top left corner
    obj.newp = newp; // array of corner points
    obj.width = pointToLineDist(newp[1], newp[2], newp[0]) || 0;
    obj.height = pointToLineDist(newp[2], newp[3], newp[0]) || 0;
    obj.toplen = dist(newp[0], newp[1]);
    obj.rightlen = dist(newp[1], newp[2]);
    obj.bottomlen = dist(newp[2], newp[3]);
    obj.leftlen = dist(newp[3], newp[0]);
    // The next refers to the transformed object's bounding box
    obj.x = minX;
    obj.y = minY;
    obj.x2 = maxX;
    obj.y2 = maxY;
    obj.width = maxX - minX;
    obj.height = maxY - minY;
    return obj;
}






function initShortcuts(){
	Mousetrap.bind(['v'], function(e) {
		console.log("redirect to v1sync");
		window.location.href="v1sync.php";
		return false;
	});

	Mousetrap.bind(['a i'], function(e) {
		console.log("redirect to admin initiatives");
		window.location.href="admin.php?type=initiatives";
		return false;
	});

	Mousetrap.bind(['a t'], function(e) {
		console.log("redirect to admin targets");
		window.location.href="admin.php?type=targets";
		return false;
	});

	Mousetrap.bind(['a m'], function(e) {
		console.log("redirect to admin metrics");
		window.location.href="admin.php?type=metrics";
		return false;
	});

		Mousetrap.bind(['a l'], function(e) {
		console.log("redirect to admin lanetext");
		window.location.href="admin.php?type=lanetext";
		return false;
	});



	Mousetrap.bind(['k'], function(e) {
		console.log("redirect to kanban");
		window.location.href="kanban.php";
		return false;
	});


	Mousetrap.bind(['m'], function(e) {
		console.log("open menus");
		$('#kanban_menu').trigger('click');
		return false;
	});

	Mousetrap.bind(['e p'], function(e) {
		console.log("export pdf");
		$('#save_as_pdf').trigger('click');
		return false;
	});

	Mousetrap.bind(['e g'], function(e) {
		console.log("export png");
		$('#save_as_png').trigger('click');
		return false;
	});

}



/** tests all needed connections
 */
function checkServices(){
		var check = $.get( KANBANV2API_URL+"targets", function() {
	  console.log("[DEBUG] checkServices()....");
	})
	  .done(function() {
		console.log( " success" );
	  })
	  .fail(function() {
		 $('.top-left').notify({
				message: { html: "<span class=\"glyphicon glyphicon-fire\"></span><span style=\"font-size:10px;font-weight:bold\"> kanban.checkServices() says:</span> <br/><div style=\"font-size:10px;font-weight:normal;margin-left:20px\">* nodeJS datagateway ("+MONGO_GATEWAY_URL+") offline...<br>* please contact <a href=\"mailto:gerold.kathan@bwinparty.com?Subject=[kanban issue]#nodeJS datagateway offline\" target=\"_top\">[your corpkanban support team]</a> for assistance</div>" },
				fadeOut: {enabled:false},
				type: "danger"
			  }).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
				  });
}
