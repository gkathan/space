/** NG version (2.0) based on node.js express and new data structures 
* depends on:
	+ kanban_core.js
	+ kanban_util.js
	+ kanban_grid.js
	+ kanban_lanes.js
	+ kanban_queues.js
	+ kanban_items.js
	+ kanban_metrics.js
	+ kanban.js
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.kathan.at
 */


/**
	 -------------------- HOWTO HIDE elements of a lane ----------------------------
	
	 d3.select("#items").selectAll("g").filter(function(d){return d.lane=="bwin"}).style("visibility","hidden")
	
	 d3.select("#items").selectAll("g").filter(function(d){return ((d.sublane=="touch")&&(d.lane=="bwin"))}).style("visibility","visible")
	
	 d3.select("#items").selectAll("g").filter(function(d){return ((d.theme=="topline"))}).style("visibility","hidden")
	 d3.select("#items").selectAll("g").filter(function(d){return ((true))}).style("visibility","hidden")
	
	 -------------------- HOWTO HIDE elements of a column ----------------------------
	
	 d3.select("#items").selectAll("g").filter(function(d){return (new Date(d.planDate)>WIP_END)}).style("visibility","hidden")


	---------------------- power of css3 selectors
	* d3.selectAll("[id*=item]").style("visibility","hidden") (wildcard *= all "*item*")

	----------------------- hide all results metrics 
	* hideMetrics([{"name":"goal","hide":true}])
	* d3.selectAll("[id*=NGR]").style("visibility","hidden")

	----------------------- hide all corporate total  metrics 
	* hideMetrics([{"name":"goal","hide":true}])
	 d3.selectAll("[id*=corp_metrics]").style("visibility","hidden")
	 d3.selectAll("[id*=metric_date]").transition().duration(300).attr("transform","translate(0,150)")
	* show 
	 d3.selectAll("[id*=corp_metrics]").style("visibility","visible")
	 d3.selectAll("[id*=metric_date]").transition().duration(300).attr("transform","translate(0,0)")


d3.select("#metrics_forecast1").transition().delay(300).style("visibility","hidden");d3.select("#metrics_forecast2").transition().duration(300).attr("transform","translate(-150,0)")
* d3.select("#metrics_forecast1").transition().delay(300).style("visibility","visible");d3.select("#metrics_forecast2").transition().duration(300).attr("transform","translate(0,0)")
	--------------------- HOWTO runtime change e.g. lanedistribution --------------------
	
	1) remove groups
		d3.select("#axes").remove()
		d3.select("#lanes").remove()
		d3.select("#queues").remove()
		d3.select("#items").remove()
		
	2) change data - e.g. reset lanePercentagesOverride
		lanePercentagesOverride=null
	
	3) re-create lane distribution
		createLaneDistribution();

	4) re-draw stuff (ordered)
		drawAxes();
		drawLanes();
		drawQueues();
		drawItems();
	
	
	OR EVEN COOLER
	1) change data e.g. WIP_WINDOW
	2) drawAll()
	
	
	
	
	highlight metrics
	* ===============
	1)dim all 
	* d3.select("#metrics_forecast1").selectAll("[id*=metric_]").style("opacity",0.2)
	* d3.select("#metrics").selectAll("[id*=metric_]").style("opacity",0.2)
	2) highlight a specific one
	* d3.selectAll("[id*=metric_701]").style("opacity",1)
	
	
*/


// global variables
var CONTEXT="CONTEXT";




var releaseData;


var boardsData;
// the current "CONTEXT"
var BOARD;

// AUTH ROLE set by php script
// current roles: bpty, exec, admin
var AUTH;


// raster px configuration

var WIDTH =1200;
var HEIGHT = 1200;

var WHITEBOARD_WIDTH =1400;
var WHITEBOARD_HEIGHT = 900;


// height of the timeline header block where the dates are in 
var TIMELINE_HEIGHT = 20;



var margin;
var width,height;


//time stuff

var yearFormat = d3.time.format("%Y-%m-%d");

var TODAY = new Date();
var TIMEMACHINE;


var WIP_WINDOW_DAYS =90;
var WIP_OFFSET_DAYS =0;
var WIP_START;
var WIP_END;

setWIP();

var KANBAN_START;
var KANBAN_END;

// diff = 44.668.800.000
// 1 pixel (WIDTH = 1500) would be 29.779.200 units

//domain for y-axis => i am using percentage as domain => meaning "100"%
var Y_MAX =100; 
var Y_MIN=0;


var x,y,svg,whiteboard,drag,drag_x;


var dataversions={};

var COLOR_BPTY="#174D75";

var COLOR_TARGET = COLOR_BPTY;


var laneData;

// additional buttons state
var SHOW_ONLY_VERSION1=false;
var SHOW_ONLY_NONVERSION1=false;


//flippant test
var back;

var tooltip;

function setMargin(){
	var _marginXRight = 20;
	var _marginXLeft = 20;
	
	var _offsetXLeft=0;
	var _offsetXRight=0;
	var _offsetYTop =0;
	
	var _offsetXLeftBaseline = 100;
	var _offsetXLeftForecast1 = 150;
	var _offsetXLeftForecast2 =150;
	var _offsetXLeftGoal = 120;
	var _offsetYTopCorporate =150;
	
	_offsetXLeft = _marginXLeft+ (SHOW_METRICS_BASELINE*_offsetXLeftBaseline);
	_offsetXRight= _marginXRight + (SHOW_METRICS_FORECAST1*_offsetXLeftForecast1)+(SHOW_METRICS_FORECAST2*_offsetXLeftForecast2)+(SHOW_METRICS_GOAL*_offsetXLeftGoal);//+ (SHOW_METRICS_FORECAST1_ACTUAL*_offsetXLeftForecast1)+(SHOW_METRICS_FORECAST2_ACTUAL*_offsetXLeftForecast2)
	_offsetYTop = (SHOW_METRICS_CORPORATE*_offsetYTopCorporate);
	
	margin = {top: 100+_offsetYTop, right: _offsetXRight+LANE_LABELBOX_RIGHT_WIDTH, bottom: 100, left: _offsetXLeft+150};
}

/**
*
*/
function init(){
	d3.select("#kanban").remove()
	
	setMargin();

	width = WIDTH - margin.left - margin.right,
	height = HEIGHT - margin.top - margin.bottom;

	y = d3.scale.linear()
		// changed 20140104 => from [0,100]
		.domain([Y_MAX,Y_MIN])
		.range([height, 0]);

	console.log(">>>>>>>>>>>>>>>>>>>> KANBAN_START: "+KANBAN_START);
	console.log(">>>>>>>>>>>>>>>>>>>> KANBAN_END: "+KANBAN_END);
	
	x = d3.time.scale()
		.domain([KANBAN_START, KANBAN_END])
		.range([0, width]);

	svg = d3.select("svg")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.append("g")
		.attr("id","kanban")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	tooltip = d3.select("body")
		.append("div")
		.attr("id","tooltip");
	

	// zoom experiment
	//svg.call(d3.behavior.zoom().on("zoom", redraw));


	drag_x = d3.behavior.drag()
	.on("drag", function(d,i) {
		d.x += d3.event.dx
		//d.y += d3.event.dy
		d3.select(this).attr("transform", function(d,i){
			return "translate(" + [ d.x,d.y ] + ")"
		})
	});
}



/** zoom experiments...
 */
function redraw() {
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}


/** main etry point
 * 
 */
function render(svgFile){
	
	checkServices();
	initShortcuts();
	
	d3.xml(svgFile, function(xml) {
		document.body.appendChild(document.importNode(xml.documentElement, true));
	
		$.when($.getJSON(dataSourceFor("lanetext")),
				$.getJSON(dataSourceFor("initiatives")),
				$.getJSON(dataSourceFor("metrics")),
				$.getJSON(dataSourceFor("releases")),
				$.getJSON(dataSourceFor("postits")),
				$.getJSON(dataSourceFor("boards")),
				$.getJSON(dataSourceFor("targets")),
				$.getJSON(dataSourceFor("lanes")),
				$.getJSON("/data/laneTextTargetPillars.json"))

			.done(function(lanetext,initiatives,metrics,releases,postits,boards,targets,lanes,pillars){
					if (lanetext[1]=="success") laneTextData=lanetext[0];
					else throw new Exception("error loading lanetext");
					if (initiatives[1]=="success") initiativeData=initiatives[0];
					else throw new Exception("error loading initiatives");
					if (metrics[1]=="success") metricData=metrics[0];
					else throw new Exception("error loading metrics");
					if (releases[1]=="success") releaseData=releases[0];
					else throw new Exception("error loading releases");
					if (postits[1]=="success") postitData=postits[0];
					else throw new Exception("error loading postits");
					if (boards[1]=="success") boardsData=boards[0];
					else throw new Exception("error loading postits");
					if (targets[1]=="success") targetData=targets[0];
					else throw new Exception("error loading targets");
					if (lanes[1]=="success") laneData=lanes[0];
					else throw new Exception("error loading lanes");
					if (pillars[1]=="success") pillarData=pillars[0];
					else throw new Exception("error loading pillars");
					
					var _boardId;
					//var _boardId="54bba57720f4764e7e797849";
					_boardId = _.last(window.location.href.split("/"));
	
					
					renderBoard(_boardId);
					
				});
	}); // end xml load anonymous 

}




function joinBoard2Initiatives(board,initiatives){
		var _items = board.items;
		
		var _join = [];
		
		for (var i in _items){
			var _initiative = getItemByKey(initiatives,"_id",_items[i].itemRef);
			if (_initiative){
				
				for (ii in _items[i].itemView){
						var _view = _items[i].itemView[ii];
						_initiative[ii]=_view;
				}
				_join.push(_initiative);
			}
		}
		//set global 
		initiativeData = _join;
		return _join;

}

/**generic render method for NG board handling
 */
function renderBoard(id){

		var board = getItemByKey(boardsData,"_id",id)
		
		HEIGHT= parseInt(board.height);
		WIDTH = parseInt(board.width);
		ITEM_SCALE = parseFloat(board.itemScale);
		ITEM_FONTSCALE = parseFloat(board.itemFontScale);
		setWIP(parseInt(board.WIPWindowDays));
		LANE_LABELBOX_RIGHT_WIDTH = parseInt(board.laneboxRightWidth);

		KANBAN_START= new Date(board.startDate);
		KANBAN_END= new Date(board.endDate);
		
		BOARD = board;
		CONTEXT = board.name;
		// we have to now join boardsData and initiative Data
		boardItems =joinBoard2Initiatives(board,initiativeData);
		
		// with drawAll() refresh without postback possible ;-)
		
		enableAllMetrics();
		
		q1_2014_reviewMetrics();
					
		drawAll();
		//drawCustomPostits();
		//initHandlers();
		
		if (AUTH=="bpty") hideNGR();
} 




/**
 * renders the custom postits which can be created manually
 */
function drawCustomPostits(){
	
	var gCustomPostits = d3.select("#kanban").append("g").attr("id","customPostits");
	for (var i in postitData){
		var p = new Postit(postitData[i].id,postitData[i].text,postitData[i].x,postitData[i].y,postitData[i].scale,postitData[i].size,postitData[i].color,postitData[i].textcolor);
		p.draw(gCustomPostits);
	}
}
	

/**
*/
function drawInitiatives(){
	
	drawLanes();
	drawWC2014();
	drawItems();
	
}


/* ------------------------ LANE sort EXPERIMENT -----------------------*/
/**
 * joins laneData with initiativeData
 * to get sorting information into each initiative item
 */
function joinInitiatives2LanesSort(){
	for (var i in initiativeData){
			var _lane = getItemByKey(laneData,"path",_.initial(initiativeData[i].lanePath.split(FQ_DELIMITER)).join([separator="/"]));
			if (_lane){
				 initiativeData[i]["laneSort"]=_lane.sort;
				if (_lane.sublanes){
					var _sublane = getItemByKey(_lane.sublanes,"name",initiativeData[i].lanePath);
					if (_sublane) initiativeData[i]["sublaneSort"]=_sublane.sort;
				}
			}
	}
	
}
/* ------------------------ EXPERIMENT -----------------------*/


function drawAll(){
	init();
	
	/** multi column sort
	 * https://github.com/Teun/thenBy.js
	 */
	var firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();

	joinInitiatives2LanesSort();
	
	//sorting hook
	//var s = firstBy(function (v1, v2) { return v1.lane < v2.lane ? -1 : (v1.lane > v2.lane ? 1 : 0); }).thenBy(function (v1, v2) { return v1.sublane < v2.sublane ? -1 : (v1.sublane > v2.sublane ? 1 : 0); });
	var s = firstBy(function (v1, v2) { return v1.laneSort - v2.laneSort})
			.thenBy(function (v1, v2) { return v1.sublaneSort - v2.sublaneSort });
	
	//initiativeData.sort(function(a,b){return (b.lane>a.lane) ?1 :-1});
	
	initiativeData.sort(s);
	initiativeData.sort(s);

	drawGuides();
	drawAxes();
	if (BOARD.viewConfig.queues!="off") drawQueues();
	if (BOARD.viewConfig.vision!="off") drawVision();
	drawVersion();
	drawLegend();

// ------------------------------------------------------------------------------------------------
  
	var _context = {"yMin":Y_MIN,"yMax":Y_MAX,"name":CONTEXT};
	itemTree = createLaneHierarchy(initiativeData,ITEMDATA_FILTER,ITEMDATA_NEST,_context);
	
	//targetTree = createLaneHierarchy(targetData,ITEMDATA_FILTER,ITEMDATA_NEST,_context);
	
	// kanban_items.js
	if (BOARD.viewConfig.initiatives!="off") drawInitiatives();
	// kanban_items.js
	//if (BOARD.viewConfig.targets!="off") drawTargets();
	
	drawOverviewMetaphors(svg);
	
	if (BOARD.viewConfig.metrics!="off") drawMetrics();
	
	drawReleases();
	

	
	d3.select("#whiteboard").style("visibility","hidden");
	
// --------------------------------------------------------------------------------------------------
}


/**
 * change TODAY date and see what happens
 * pass date in format "yyyy-mm-dd" or "today" to reset to today
 * */
function timeMachine(date){
	if (date!="today") TIMEMACHINE = new Date(date);
	else {
		TIMEMACHINE = null;
		// and reload();
		//d3.tsv("data/"+dataversions.itemFile,handleInitiatives);
	}
	setTODAY();
	setWIP();
	//insanity check
	drawAll();
	calculateQueueMetrics();
	drawAll();
	
}

/** whenever we use the TODAY.add() function we need to set back TODAY to original value...
 * */
function setWIP(wipDays){
	WIP_START = TODAY.add(WIP_OFFSET_DAYS).days();
	setTODAY();
	WIP_END = TODAY.add(wipDays+WIP_OFFSET_DAYS).days();
	setTODAY();
}

function setTODAY(){
	if (TIMEMACHINE) TODAY = new Date(TIMEMACHINE);
	else TODAY = new Date();
}

function hideKanbanboard(){
	d3.select("#kanban").style("visibility","hidden")
}

function showKanbanboard(){
	d3.select("#kanban").style("visibility","visible")
}







	var PACKAGE_VERSION="20150116_1312";
	
