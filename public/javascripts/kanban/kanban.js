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
var initiativeData;
var boardData;
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
var SHOW_METRICS_CORPORATE=0;

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
var BOARD_OFFSET_TOP=100;


function setMargin(){
	var _marginXRight = 200;
	var _marginXLeft = 20;
	var _offsetXLeft=0;
	var _offsetXRight=0;
	var _offsetYTop = BOARD_OFFSET_TOP;
	var _offsetXLeftBaseline = 100;
	var _offsetXLeftForecast1 = 150;
	var _offsetXLeftForecast2 =150;
	var _offsetXLeftGoal = 120;
	var _offsetYTopCorporate =150;
	_offsetXLeft = _marginXLeft+ (SHOW_METRICS_BASELINE*_offsetXLeftBaseline);
	_offsetXRight= _marginXRight + (SHOW_METRICS_FORECAST1*_offsetXLeftForecast1)+(SHOW_METRICS_FORECAST2*_offsetXLeftForecast2)+(SHOW_METRICS_GOAL*_offsetXLeftGoal);//+ (SHOW_METRICS_FORECAST1_ACTUAL*_offsetXLeftForecast1)+(SHOW_METRICS_FORECAST2_ACTUAL*_offsetXLeftForecast2)
	_offsetYTop = (SHOW_METRICS_CORPORATE*_offsetYTopCorporate)+_offsetYTop;
	margin = {top: _offsetYTop, right: _offsetXRight+LANE_LABELBOX_RIGHT_WIDTH, bottom: 100, left: _offsetXLeft+150};
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
	initShortcuts();
	d3.xml(svgFile, function(xml) {

		$('#board').append(document.importNode(xml.documentElement, true));
		//document.body.appendChild(document.importNode(xml.documentElement, true));

		var _boardId;
		//var _boardId="54bba57720f4764e7e797849";
		_boardId = _.last(window.location.href.split("/"));
		console.log("_url: "+dataSourceFor("boards/"+_boardId));
		$.getJSON(dataSourceFor("boards/"+_boardId),function(board){
			boardData=board;
			var _filterQueryString ="?true=true"+_createFilterQueryString(board);
			var _urlItems = dataSourceFor("items"+board.dataLink)+_filterQueryString;
			$.getJSON(_urlItems,function(items){
				console.log("items loaded...from: "+_urlItems);

				//the original loaded items
				initiativeData=items;

				renderBoard(_boardId);
			})
		})
	}); // end xml load anonymous
}



/**
builds URL query string out of filter attributes
*/
function _createFilterQueryString(board){
	var _filter="";
	if (board.filter.Targets){
	 	_filter+="&filter_Targets="+board.filter.Targets;
	}
	if (board.filter.Customers){
		_filter+="&filter_Customers="+board.filter.Customers;
	}
	if (board.filter.Markets){
		_filter+="&filter_Markets="+board.filter.Markets;
	}
	if (board.filter.Status){
		_filter+="&filter_Status="+board.filter.Status;
	}
	if (board.filter.Product){
		_filter+="&filter_Product="+board.filter.Product;
	}
	return _filter;
}

/**helper
*/
function _createItem(epic,groupby,boardName){
	console.log("======== _createItem: epic: "+epic.Number+ " - groupby: "+groupby);
	console.log("====== epic:PlanningBacklog: "+epic.PlanningBacklog);
	//split / join needed e.g. if businessbacklog is used we need to replace "/"
	if (!epic[groupby[0]]) epic[groupby[0]]=boardName;
	if (!epic[groupby[1]]) epic[groupby[1]]="empty";
	if (!epic[groupby[2]]) epic[groupby[2]]="empty";

	var _group1 = epic[groupby[0]].split("/").join("|");
	var _group2 = epic[groupby[1]].split("/").join("|");
	var _group3 = epic[groupby[2]].split("/").join("|");
	var _product = epic.Product;
	var _path = boardName+"/"+_group1+"/"+_group2+"/"+_group3;
	console.log("====== epic:lanePath: "+_path);

	// !!!! path needs 3 levels right now at least
	if (!_product) _product="No Product";
	var _itemView={sublaneOffset:0,size:7,accuracy:10,lanePath:_path}
	var _item ={itemRef:epic.Number,itemView:_itemView};
	return _item;
}


function joinBoard2Initiatives(board,initiatives){
	console.log("join: "+initiatives.length+" board: "+board.items.length);
	var _items = board.items;
	var _join = [];
	for (var i in _items){
		var _i = _items[i];
		var _joinedItem={};
		var _initiative = _.findWhere(initiatives,{"Number":_i.itemRef});
		// legacy attributes
		if (_initiative){
			_joinedItem.id=_i.itemRef;
			_joinedItem.Number=_i.itemRef;
			_joinedItem.Type="item";
			if (_initiative.Status=="Done" || _initiative.Status=="Monitoring")
				_joinedItem.state="done";
			else if (_initiative.Status=="Cancelled")
				_joinedItem.state="killed";
			else
				_joinedItem.state="planned";

			_joinedItem.name=_initiative.Name;
			_joinedItem.health=_initiative.Health;
			_joinedItem.healthComment=_initiative.HealthComment;
			_joinedItem.Value=_initiative.Value;
			_joinedItem.Swag=_initiative.Swag;
			_joinedItem.status=_initiative.Status;
			_joinedItem.ExtId=_initiative.ID;
			_joinedItem.isCorporate=_initiative.PortfolioApproval;
			_joinedItem.owner=_initiative.InitiativeOwner;
			_joinedItem.DoD=_initiative.ElevatorPitch;
			_joinedItem.startDate=_initiative.PlannedStart;
			_joinedItem.planDate=_initiative.PlannedEnd;

			if (_initiative.LaunchDate)
				_joinedItem.actualDate=_initiative.LaunchDate;
			else
				_joinedItem.actualDate=_initiative.PlannedEnd;

			for (_key in _i.itemView){
				var _view = _items[i].itemView[_key];
				_joinedItem[_key]=_view;
			}
			if (moment(_joinedItem.actualDate) >= moment(board.startDate)){
				_join.push(_joinedItem);
			}
		}
	}//end for
	//set global
	//initiativeData = _join;
	return _join;
}

/**generic render method for NG board handling
 */
function renderBoard(id){
		HEIGHT= parseInt(boardData.height);
		WIDTH = parseInt(boardData.width);
		ITEM_SCALE = parseFloat(boardData.itemScale);
		ITEM_FONTSCALE = parseFloat(boardData.itemFontScale);
		setWIP(parseInt(boardData.WIPWindowDays));
		if (boardData.viewConfig.laneboxRightWidth) LANE_LABELBOX_RIGHT_WIDTH = parseInt(boardData.viewConfig.laneboxRightWidth);
		if (boardData.viewConfig.offsetTop) BOARD_OFFSET_TOP = parseInt(boardData.viewConfig.offsetTop);
		KANBAN_START= new Date(boardData.startDate);
		KANBAN_END= new Date(boardData.endDate);
		BOARD = boardData;
		CONTEXT = boardData.name;
		/*
		initiativeData = _.filter(initiativeData,function(item){
			if(!item.Status || item.Status=="On hold" || item.Status=="Cancelled") return false;
			return true;
		})
		*/
		// we have to now join boardData and initiative Data
		var _items=[];

		for (var i in initiativeData){
			var _i = initiativeData[i];
			_items.push(_createItem(_i,boardData.groupby.split(","),boardData.name));
		}
		boardData.items =_items

		boardItems =joinBoard2Initiatives(boardData,initiativeData);
		// with drawAll() refresh without postback possible ;-)
		disableAllMetrics();
		console.log("---- lets draw ALL");
		//q1_2014_reviewMetrics();
		console.log("======= initiatives.length: "+initiativeData.length);
		drawAll(boardItems);
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
function drawInitiatives(boardItems){
	if (BOARD.viewConfig.lanes!="off") drawLanes();
	drawItems(boardItems);
}

/* ------------------------ LANE sort EXPERIMENT -----------------------*/
/**
 * joins laneData with initiativeData
 * to get sorting information into each initiative item
 */
function joinInitiatives2LanesSort(boardItems){
	for (var i in boardItems){
		var _lane = getItemByKey(laneData,"path",_.initial(boardItems[i].lanePath.split(FQ_DELIMITER)).join([separator="/"]));
		if (_lane){
			 boardItems[i]["laneSort"]=_lane.sort;
			if (_lane.sublanes){
				var _sublane = getItemByKey(_lane.sublanes,"name",boardItems[i].lanePath);
				if (_sublane) boardItems[i]["sublaneSort"]=_sublane.sort;
			}
		}
	}
}
/* ------------------------ EXPERIMENT -----------------------*/


function drawAll(boardItems){
	console.log("======= boardItems.length: "+boardItems.length);
	init();
	// 1) draw static stuff
	if (BOARD.viewConfig.queues!="off") drawGuides();
	drawAxes();
	if (BOARD.viewConfig.queues!="off") drawQueues(boardItems);
	if (BOARD.viewConfig.vision!="off") drawVision();
	drawVersion();
	drawLegend();

	// 2) check if board empty
	console.log("======= boardItems.length: "+boardItems.length);
	if (boardItems.length>0){
		// multi column sort https://github.com/Teun/thenBy.js
		var firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();
		joinInitiatives2LanesSort(boardItems);
		//sorting hook
		//var s = firstBy(function (v1, v2) { return v1.lane < v2.lane ? -1 : (v1.lane > v2.lane ? 1 : 0); }).thenBy(function (v1, v2) { return v1.sublane < v2.sublane ? -1 : (v1.sublane > v2.sublane ? 1 : 0); });
		var s = firstBy(function (v1, v2) { return v1.laneSort - v2.laneSort})
				.thenBy(function (v1, v2) { return v1.sublaneSort - v2.sublaneSort });
		boardItems.sort(s);
		boardItems.sort(s);
		// ------------------------------------------------------------------------------------------------
		var _context = {"yMin":Y_MIN,"yMax":Y_MAX,"name":CONTEXT};
		itemTree = createLaneHierarchy(boardItems,ITEMDATA_FILTER,BOARD.groupby.split(","),_context);
		//targetTree = createLaneHierarchy(targetData,ITEMDATA_FILTER,BOARD.groupby,_context);
		// kanban_items.js
		if (BOARD.viewConfig.initiatives!="off") drawInitiatives(boardItems);
		// kanban_items.js
		if (BOARD.viewConfig.targets!="off") drawTargets(boardItems);
		if (BOARD.viewConfig.metrics!="off") drawMetrics(boardItems);
	}
	//drawOverviewMetaphors(svg);
		//if (BOARD.viewConfig.releases!="off") drawMetrics();drawReleases();
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
	WIP_START = moment(TODAY).add("days",WIP_OFFSET_DAYS);
	setTODAY();
	WIP_END = moment(TODAY).add("days",wipDays+WIP_OFFSET_DAYS);
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
