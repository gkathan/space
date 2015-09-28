/** kanban_lanes
* depends on:
	+ kanban_core.js
	+ kanban_util.js
 * @version: 2.0
 * @author: Gerold Kathan (www.kathan.at)
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */
var laneTextData;
var pillarData;
var PILLAR_TOP = -40;
// pillars will use LANE_LABELBOX_RIGHT_WIDTH-PILLAR_X_OFFSET space
var PILLAR_X_OFFSET=90;
// size of white space around boxes
var WIDTH_WHITESTROKE ="5px";
var LANE_LABELBOX_LEFT_WIDTH =100;
var LANE_LABELBOX_RIGHT_WIDTH =100;
var CONTEXTBOX_WIDTH=50;


var LANE_LABELBOX_RIGHT_START;
// ----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- LANES SECTION ---------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------
/**
*
*/
function drawLanes(){
	d3.select("#lanes").remove()
	var lanes = svg.append("g").attr("id","lanes");
	if (BOARD.viewConfig.lanes=="hide"){
		lanes.style("opacity",0);
	}
	if (BOARD.viewConfig.laneboxLeftWidth)
		LANE_LABELBOX_LEFT_WIDTH = parseInt(BOARD.viewConfig.laneboxLeftWidth);
	if (BOARD.viewConfig.laneboxRightWidth)
		LANE_LABELBOX_RIGHT_WIDTH = parseInt(BOARD.viewConfig.laneboxRightWidth);
	if (BOARD.viewConfig.contextboxWidth)
		CONTEXTBOX_WIDTH = parseInt(BOARD.viewConfig.contextboxWidth);

	var laneConfig={contextbox:{
			orientation:"vertical",
			height:20
		}
	};

//experiment
	//var drag_item = _registerDragDrop();
//experiment
	var lanesLeft = lanes.append("g").attr("id","lanesLeft");
	var lanesRight = lanes.append("g").attr("id","lanesRight");
	//------------ context box ----------------
	/**
	 * this would be level-0 in a generic view
	 * in this concrete view this would be the "businessmodel=b2c gaming" umbrell box
	 * */
	//_drawLaneContext(lanes,CONTEXT,-margin.left,0,LANE_LABELBOX_LEFT_WIDTH/4,height,"treemap.html")
	var i=0;
	var _xRightStart = x(KANBAN_END)+TARGETS_COL_WIDTH;

	lanes.selectAll("#lane")
	// [changed 20140104]
	.data(getThemesNEW())
	.enter()
	// **************** grouped item + svg block + label text
	.append("g")
	.attr("id",function(d){return "theme_"+d.name;})

	//.style("opacity",function(d){return d.accuracy/10})
	//.on("mouseover",animateScaleUp)
	.each(function(_theme){
		//level1
		_drawTheme(_theme,d3.select(this),laneConfig);
		for (var l in _theme.children){
			//level2
			var _lane = _theme.children[l];
			_drawLane(_lane,d3.select(this),lanesLeft,lanesRight,_xRightStart,laneConfig,l);
			//level3
			_drawSublanes(_lane,lanesLeft);
			//experiment
			//_leftBox.data([ {"x":0, "y":0, "lane":_lane} ]).call(drag_item);
			_drawThemeDemarcation(d3.select(this),"themeLine");
		}
	});
	// -------------------------------------- drivers WHERE HOW STUFF -----------------------------------
	var _pillarColumns = [{"name":"ACCESS"},{"name":"APPEAL"},{"name":"USP"}];
	var _xBase = _xRightStart+2;
	var _yBase = PILLAR_TOP;
	var _width = LANE_LABELBOX_RIGHT_WIDTH-PILLAR_X_OFFSET;

	if (_width >100 & CONTEXT=="b2c gaming") {
		  _drawPillarColumns(lanesRight,_pillarColumns,_xBase,_yBase,_width);
		  _drawHowPillars(lanesRight,pillarData,_xBase,_yBase,_width);
	}
}

function _drawLane(d,svg,lanesLeft,lanesRight,_xRightStart,laneConfig,count){
	var _lane = d.name;
	// [changed 20140104]
	var _y = y(d.yt1);
	var _height = y(d.yt2-d.yt1);
	var _x_offset = 5;
	var _y_offset = 4;
	var _laneOpacity;
	var _metrics;
	//left box
	var _leftBox = lanesLeft.append("g").attr("id",_lane);
	var _rightBox = lanesRight.append("g").attr("id",_lane);
	_metrics = _drawLaneBox(_leftBox,-LANE_LABELBOX_LEFT_WIDTH,_y,LANE_LABELBOX_LEFT_WIDTH,_height,_lane,"left",laneConfig,count);
	var _yTextOffset = 10;
	if (_metrics) _yTextOffset+=_metrics.height;
	//baseline box text
	if (BOARD.viewConfig.laneboxTextLeft!="off") _drawLaneText(_leftBox,_lane,"baseline",_yTextOffset);
	// lane area
	_drawLaneArea(svg,x(KANBAN_START),_y,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+280,_height,i)
	//target box
	_metrics =_drawLaneBox(_rightBox,_xRightStart,_y,LANE_LABELBOX_RIGHT_WIDTH,_height,_lane,"right",laneConfig,count);
	//target box text
	if (BOARD.viewConfig.laneboxTextRight!="off") _drawLaneText(_rightBox,_lane,"target",_yTextOffset);
	// laneside descriptors
	if (_.last(CONTEXT.split(FQ_DELIMITER))=="drill-in"){
		var _laneName = _.last(_lane.split(FQ_DELIMITER))
		_drawLaneSideText(lanesLeft,_laneName,-LANE_LABELBOX_LEFT_WIDTH-2,_y+3,"5px","start");
	}
}

function _drawSublanes(d,svg){
	var lane = d.name;
	//sublane descriptors
	var _sublanes = getSublanesNEW(lane);
	for (var s in _sublanes){
		var _y = y(_sublanes[s].yt1);
		var _h = y(_sublanes[s].yt2-_sublanes[s].yt1);
		// strip only the sublane name if name is fully qualified like "topline.bwin.touch"
		var _sublane = _.last((_sublanes[s].name).split(FQ_DELIMITER))
		if (BOARD.viewConfig.sublaneText!="off"){
			_drawLaneSideText(svg,_sublane,1,_y+_h/2,"4px","middle");
		}
		if (BOARD.viewConfig.sublaneLine!="off"){
			//no lines for first and last sublane
			if (s>0 && s<_sublanes.length){
				_drawLine(svg,x(KANBAN_START),_y,x(KANBAN_END),_y,"sublaneLine");
			}
		}
	}
}

function _drawTheme(_theme,svg,laneConfig){
	console.log("---orientation: "+laneConfig.contextbox.orientation)
	var _t1 = y(_theme.yt1);
	var _t2 = y(_theme.yt2);
	var _height = _t2-_t1;
	var _name = _.last(_theme.name.split("/"));


	if (laneConfig.contextbox.orientation=="vertical")
		_drawLaneContext(svg,_name,-LANE_LABELBOX_LEFT_WIDTH-CONTEXTBOX_WIDTH,_t1,CONTEXTBOX_WIDTH,_height,"","themebox",laneConfig)
	else if (laneConfig.contextbox.orientation=="horizontal")
		_drawLaneContext(svg,_name,-LANE_LABELBOX_LEFT_WIDTH-CONTEXTBOX_WIDTH,_t1,LANE_LABELBOX_LEFT_WIDTH+CONTEXTBOX_WIDTH,laneConfig.contextbox.height,"","themebox",laneConfig)
}

function _drawThemeDemarcation(svg,css){
	//check for demarcation between topline and enabling
	// => this needs first refactoring of in-memory datastructure !!!
	// HAHAAAA :-)) [20140104] did it !!!!
	var _y=0;
	for (t in getThemesNEW()){
		var _theme = getThemesNEW()[t];
		var _t1 = y(_theme.yt1);
		var _t2 = y(_theme.yt2);
		var _height = _t2-_t1;
		var _name = _.last(_theme.name.split("/"));
		// no demarcation line in the end ;-)
		if (t<getThemesNEW().length-1){
			_drawLine(svg,x(KANBAN_START)-margin.left,_t2,x(KANBAN_END)+margin.right+margin.left,_t2,css);
			_y=_t2
		}
	}
	return _y;
}


/** helper method to render the strategical driver columns
 */
function _drawPillarColumns(svg,data,x,y,width){
	var _spacer = 3;
	var _color = COLOR_BPTY;
	var _length = data.length;
	var _pillarWidth = (width/_length)-_spacer;
	var _height = height-PILLAR_TOP;
	var _headlineSize = "8px";

	for (var i in data){
		//1) pillar header
		var _offset = (getInt(i)*_pillarWidth)+_pillarWidth/2;
		_drawText(svg,data[i].name,(x+_offset+(i*_spacer)),(y+_spacer),{"size":_headlineSize,"color":_color,"mode":"tb","weight":"bold","opacity":0.3});
		//2) pillar rect
		svg.append("rect")
			.attr("x",x+(i*_pillarWidth)+(i*_spacer))
			.attr("y",y-_spacer)
			.attr("width",_pillarWidth)
			.attr("height",_height)
			.style("fill","grey")
			.style("opacity",0.1);
	}
}

function _drawHowPillars(svg,data,x,y,width){
	var _spacer = 2;
	var _color = COLOR_BPTY;
	var _headlineSize = "12px";
	var _textSize="5px";
	var _d = _.nest(data,"lane");
	//0 HOW
	_drawText(svg,"HOW",(x+width/2),(y-(3*_spacer)),{"size":"14px","color":COLOR_BPTY,"opacity":0.3,"anchor":"middle","weight":"bold"});
	_drawText(svg,"WHERE",(x+width/2)+100,-5,{"size":"14px","color":COLOR_BPTY,"opacity":0.3,"anchor":"middle","weight":"bold"});
	// for each lane
	for (l in _d.children){
		var _data = _d.children[l];
		var _length = _data.children.length;
		var _pillarWidth = (width/_length)-_spacer;
		var _headlineHeight= 90;
		var _height = height+_headlineHeight;
		var _y = this.y(getLaneByNameNEW(_data.name).yt1);
		var _color = "black";
		if (_data.name.indexOf("bwin") !=-1 || _data.name.indexOf("premium") !=-1) _color="white";
		//for each pillar
		for (var i in _data.children){
			var _offset = (getInt(i)*_pillarWidth)+_pillarWidth/2;
			//3) content title
			_drawText(svg,_data.children[i].title,(x+_offset+(i*_spacer)),(_y+10),{"size":"5px","color":_color,"anchor":"middle","weight":"bold"});
			//4) content / text
			for (var c in _data.children[i].content){
				var _text = _data.children[i].content[c].text;
				_drawText(svg,_text,(x-6+((getInt(i)+1)*_pillarWidth)+(i*_spacer)-(c*6)),(_y+12),{"size":_textSize,"color":_color,"weight":"normal","mode":"tb"});
			}
		}
	}
}

function _drawLaneText(svg,lane,side,logoHeight){
	var i=0;
	var _anchor ="start";
	if (side=="target") _anchor ="end";
	var _color = "black";
	var _yBase = y((getLaneByNameNEW(lane).yt1))+logoHeight+5;
	// just get the last element in a FQN
	lane = _.last(lane.split(FQ_DELIMITER))
	if (lane=="bwin" || lane=="premium") _color="white";
	var _xBase;
	if (side=="baseline") _xBase= -LANE_LABELBOX_LEFT_WIDTH+10
	else if (side=="target") _xBase= x(KANBAN_END)+TARGETS_COL_WIDTH+LANE_LABELBOX_RIGHT_WIDTH-10;
	if (laneTextData){
	var _lanetext = laneTextData.filter(function(d){return (d.lane==lane && d.side==side)});
		if (_lanetext && CONTEXT!="holding"){
			var gLanetext = svg.append("g").attr("id","text_"+lane);
			for (var i in _lanetext){
					_drawText(gLanetext,_lanetext[i].text,_xBase,(_yBase+(i*(parseInt(_lanetext[i].size)+1))),{"size":_lanetext[i].size+"px","color":_color,"anchor":_anchor,"weight":_lanetext[i].format});
			}
		}
	}
}

function highlightLane(svg,lane){
	var _highlight = svg.append("rect")
		.attr("x",-5)
		.attr("y",y(lane.yt1))
		.attr("width",1000)
		.attr("height",y(lane.yt2-lane.yt1))
		.style("fill","red")
		.style("opacity",0.1);

	_highlight.attr("id","highlightlane");
	return _highlight;
}

/* ------------------------------------------------- drawLanes() helper functions ----------------------------------------------------------- */
/* @level0
 */
function _drawLaneContext(svg,context,x,y,width,height,link,css,laneConfig){
	var _textOffsetX = 15;
	var _textOffsetY = 5;
	var _textOffsetYHorizontal = height-(height/2);
	var _textOffsetXHorizontal = 10;
	if (!css) var css ="contextbox";
	//default
	var _textStyle = {"size":"8px","color":"grey","weight":"normal","mode":"tb"};
	if (BOARD.viewConfig.contextboxText)
		_textStyle=BOARD.viewConfig.contextboxText;
	if (laneConfig.contextbox.orientation=="horizontal"){
		_textStyle.mode="";
		_drawText(svg,context.toUpperCase(),(x+_textOffsetXHorizontal),(y+_textOffsetYHorizontal),_textStyle);

	}
	else
		_drawText(svg,context.toUpperCase(),(x+_textOffsetX),(y+_textOffsetY),_textStyle);
	svg.append("rect")
	.attr("x",x)
	.attr("y",y)
	.attr("width",width)
	.attr("height",height)
		.on("click",function(d){window.location.href=link;})
	.attr("class",css);

	if (CONFIG.initiatives.states.colors[context]){
			svg.append("rect")
			.attr("x",x)
			.attr("y",y)
			.attr("width",8)
			.attr("height",height)
			.attr("class",css)
			.style("fill",CONFIG.initiatives.states.colors[context])
	}
}

/**
 * returns the metrics of logo
 */
function _drawLaneBox(svg,x,y,width,height,lane,side,laneConfig,count){
	var _x_offset=10;
	var _y_offset=4;
	var _metrics;

	var _topOffset=0;
	// set differntly when contextbox is horizontal and count is 0 = the first lanebox
	if (laneConfig.contextbox.orientation=="horizontal" &&count==0){
		_topOffset=laneConfig.contextbox.height;
		y+=_topOffset;
		height-=_topOffset;
	}


	// if it comes in FQ format
	lane = _.last(lane.split(FQ_DELIMITER));
	var _lanebox=svg.append("rect")
	.attr("x",x)
	.attr("y",y)
	.attr("width",width)
	.attr("height",height)
	.style("cursor","pointer")
	.style("stroke","white")
	.style("stroke-width",WIDTH_WHITESTROKE)
	.style("fill","#eeeeee");
	//.attr("class","lanebox "+lane);
	//.on("click",function(d){window.location.href="kanban_"+lane+".html";});

	if (CONFIG.initiatives.states.colors[lane]){
			svg.append("rect")
			.attr("x",x)
			.attr("y",y+3)
			.attr("width",3)
			.attr("height",height)
			.style("fill",CONFIG.initiatives.states.colors[lane])
	}
	// only append logo if we have declared on in external.svg
	if (document.getElementById(lane)){
		var _x = x+_x_offset;
		var _y = y+_y_offset;
		var _logo = _drawXlink(svg,"#"+lane,0,0,{"scale":1});
		_metrics = get_metrics(_logo.node());
		// i need to know the width of the logo....
		if (side=="right"){
			_x= x+LANE_LABELBOX_RIGHT_WIDTH-_metrics.width-10;
		}
		_logo.attr("transform","translate("+_x+","+_y+") scale(1)");
	}
	// if no logo just write the name
	else {
		//default
		var _textStyle = {"size":"9px","color":"grey","weight":"normal","mode":""};
		if (BOARD.viewConfig.laneboxText)
			_textStyle=BOARD.viewConfig.laneboxText;
		_drawText(svg,lane,x+5,y+15,_textStyle);
	}
return _metrics;
}

function _drawLaneArea(svg,x,y,width,height,i){
	if (i%2 ==0) _laneOpacity=0.22;
	else _laneOpacity=0.12;
	svg.append("rect")
	.attr("x",x)
	.attr("y",y)
	.attr("width",width)
	.attr("height",height)
	.style("fill","url(#gradientGrey)")
	.style("stroke","white")
	.style("stroke-width",WIDTH_WHITESTROKE)
	.style("opacity",_laneOpacity);
}

/**
 */
function _drawLaneSideText(svg,text,x,y,size,anchor){
	_drawText(svg,text,x,y,{"size":size,"color":"grey","weight":"normal","mode":"tb","anchor":anchor});
}

/* ------------------------------------------------- END drawLanes() helper functions ----------------------------------------------------------- */
