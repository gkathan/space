/** NG version (2.0) based on node.js express and new data structures
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */



var VISION_TEXT = "\"let the world play for real\"";
var VISION_SUBTEXT = "\"be the leader in regulated and to be regulated markets\"";



/** draws grid
*
*/
function drawAxes(){
	d3.select("#axes").remove();

	var formatNumber = d3.format(".1f");

	var xAxis = d3.svg.axis()
		.scale(x)
		.ticks(d3.time.month)
		.tickSize(2, 0)
		.tickPadding(2)
		.tickFormat(d3.time.format("%b"))
		.orient("bottom");

	var xAxisTop = d3.svg.axis()
		.scale(x)
		.ticks(d3.time.month)
		.tickSize(2, 0)
		.tickPadding(2)
		.tickFormat(d3.time.format("%b"))
		.orient("top");

	var xAxisYearTop = d3.svg.axis()
		.scale(x)
		.ticks(d3.time.year)
		.tickSize(0,0)
		.tickFormat(d3.time.format("%Y"))
		.tickPadding(11)
		.orient("top");

	var xAxisYear = d3.svg.axis()
		.scale(x)
		.ticks(d3.time.year)
		.tickSize(0,0)
		.tickFormat(d3.time.format("%Y"))
		.tickPadding(11)
		.orient("bottom");

	//ticksize(width) for lane separators
	var yAxis = d3.svg.axis()
		.scale(y)
		.tickSize(0)
		.tickFormat("")
		//.tickValues(laneDistribution)
		.orient("right");

//################# AXES SECTION #####################

	var gAxes =svg.append("g")
		.attr("id","axes");

	if (BOARD.viewConfig.axes=="hide"){
		gAxes.style("opacity",0);
	}



	var gy = gAxes.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.call(customAxis);

	var gx = gAxes.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size","8px")
		.call(xAxis);

	var gxTop = gAxes.append("g")
		.attr("class", "x axis")
		.style("font-size","8px")
		.call(xAxisTop);

	var gxYearTop = gAxes.append("g")
		.attr("class", "x axis year")
		.style("font-weight","bold")
		.style("font-size","10px")
		.style("margin-bottom","40px")
		.call(xAxisYearTop);

	var gxYear = gAxes.append("g")
		.attr("class", "x axis year")
		.attr("transform", "translate(0," + height + ")")
		.style("font-weight","bold")
		.style("font-size","10px")
		.style("margin-bottom","-40px")
		.call(xAxisYear);
	// axis end

	//_drawLine(gAxes,-LANE_LABELBOX_LEFT_WIDTH,-TIMELINE_HEIGHT,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH,-TIMELINE_HEIGHT,"gridTop");
	//_drawLine(gAxes,-LANE_LABELBOX_LEFT_WIDTH,height+TIMELINE_HEIGHT,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH,height+TIMELINE_HEIGHT,"gridTop");

//################# AND SOME TIME GUIDES

	var _monthGuides = d3.time.month.range(KANBAN_START,KANBAN_END,1);
	var _yearGuides = d3.time.month.range(KANBAN_START,KANBAN_END,12);

	for (i=0;i<_monthGuides.length;i++){
		_drawLine(gAxes,x(new Date(_monthGuides[i])),0,x(new Date(_monthGuides[i])),height,"monthGuide");
	}

	for (i=0;i<_yearGuides.length;i++){
		_drawLine(gAxes,x(new Date(_yearGuides[i])),0,x(new Date(_yearGuides[i])),height,"yearGuide");
	}
}


function drawGuides(){
	LANE_LABELBOX_RIGHT_START = x(KANBAN_END)+TARGETS_COL_WIDTH;

	var gGuides= svg.append("g").attr("id","guides");

	var _style = {"size":"4px", "weight":"normal","anchor":"start","color":"#cccccc"};

	// horizontal top
	_drawLine(gGuides,x(KANBAN_START)-margin.left,0-margin.top,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,0-margin.top,"rasterLine");
	_drawText(gGuides,"0-margin.top"+(-margin.top)+"px",x(KANBAN_START)-margin.left,(-margin.top+2),_style);

	//horizontal TIMELINE top
	_drawLine(gGuides,x(KANBAN_START)-margin.left,-TIMELINE_HEIGHT,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,-TIMELINE_HEIGHT,"rasterLine");
	_drawText(gGuides,"TIMELINE_HEIGHT: "+(-TIMELINE_HEIGHT)+"px",x(KANBAN_START)-margin.left,(-TIMELINE_HEIGHT-2),_style);


	// horizontal KANBAN top
	_drawLine(gGuides,x(KANBAN_START)-margin.left,0,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,0,"rasterLineThick");
	_drawText(gGuides,"KANBAN Y base: "+0+"px",x(KANBAN_START)-margin.left,-2,_style);
	//vertical METRIC_BASE
	_drawLine(gGuides,x(KANBAN_START)-METRIC_BASE_X_OFFSET,0-margin.top,x(KANBAN_START)-METRIC_BASE_X_OFFSET,height+margin.bottom,"rasterLine");

	//vertical KANBAN_START
	_drawLine(gGuides,x(KANBAN_START),0-margin.top,x(KANBAN_START),height+margin.bottom,"rasterLineThick");
	//vertical LANELABELBOX start
	_drawLine(gGuides,x(KANBAN_START)-LANE_LABELBOX_LEFT_WIDTH,0-margin.top,x(KANBAN_START)-LANE_LABELBOX_LEFT_WIDTH,height+margin.bottom,"rasterLine");
	//horizontal KANBAN bottom
	_drawLine(gGuides,x(KANBAN_START)-margin.left,height,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,height,"rasterLine");
	_drawText(gGuides,"height: "+height+"px",x(KANBAN_START)-margin.left,height,_style);

	//horizontal METRICS
	_drawLine(gGuides,x(KANBAN_START)-margin.left,METRIC_BASE_Y,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,METRIC_BASE_Y,"rasterLine");
	_drawText(gGuides,"METRIC_BASE_Y: "+(METRIC_BASE_Y)+"px",x(KANBAN_START)-margin.left,(METRIC_BASE_Y-2),_style);
	//horizontal METRICS_PIE
	_drawLine(gGuides,x(KANBAN_START)-margin.left,METRIC_PIE_BASE_Y,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,METRIC_PIE_BASE_Y,"rasterLine");
	_drawText(gGuides,"METRIC_PIE_BASE_Y: "+(METRIC_PIE_BASE_Y)+"px",x(KANBAN_START)-margin.left,(METRIC_PIE_BASE_Y-2),_style);
	//horizontal METRICS_CX
	_drawLine(gGuides,x(KANBAN_START)-margin.left,METRIC_CX_BASE_Y,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,METRIC_CX_BASE_Y,"rasterLine");
	_drawText(gGuides,"METRIC_CX_BASE_Y: "+(METRIC_CX_BASE_Y)+"px",x(KANBAN_START)-margin.left,(METRIC_CX_BASE_Y-2),_style);
	//horizontal METRICS_SHARE
	_drawLine(gGuides,x(KANBAN_START)-margin.left,METRIC_SHARE_BASE_Y,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,METRIC_SHARE_BASE_Y,"rasterLine");
	_drawText(gGuides,"METRIC_SHARE_BASE_Y: "+(METRIC_SHARE_BASE_Y)+"px",x(KANBAN_START)-margin.left,(METRIC_SHARE_BASE_Y-2),_style);
	//horizontal METRICS BASE top
	_drawLine(gGuides,x(KANBAN_START)-margin.left,PILLAR_TOP,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,PILLAR_TOP,"rasterLine");
	_drawText(gGuides,"PILLAR_TOP: "+PILLAR_TOP+"px",x(KANBAN_START)-margin.left,(PILLAR_TOP-2),_style);
	//horizontal TIMELINE bottom
	_drawLine(gGuides,x(KANBAN_START)-margin.left,height+TIMELINE_HEIGHT,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,height+TIMELINE_HEIGHT,"rasterLine");
	_drawText(gGuides,"height+TIMELINE: "+(height+TIMELINE_HEIGHT)+"px",x(KANBAN_START)-margin.left,(height+TIMELINE_HEIGHT-2),_style);

	//horizontal METRIC BRACKET bottom
	_drawLine(gGuides,x(KANBAN_START)-margin.left,height+METRIC_BRACKET_Y_OFFSET,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,height+METRIC_BRACKET_Y_OFFSET,"rasterLine");
	_drawText(gGuides,"height+METRIC_BRACKET_Y_OFFSET: "+(height+METRIC_BRACKET_Y_OFFSET)+"px",x(KANBAN_START)-margin.left,(height+METRIC_BRACKET_Y_OFFSET-2),_style);
	//horizontal METRIC PILLAR bottom
	_drawLine(gGuides,x(KANBAN_START)-margin.left,height-PILLAR_TOP,x(KANBAN_END)+LANE_LABELBOX_RIGHT_WIDTH+TARGETS_COL_WIDTH+margin.right,height-PILLAR_TOP,"rasterLine");
	_drawText(gGuides,"height-PILLAR_TOP "+(height-PILLAR_TOP)+"px",x(KANBAN_START)-margin.left,(height-PILLAR_TOP-2),_style);

	//vertical KANBAN_END
	_drawLine(gGuides,x(KANBAN_END),0-margin.top,x(KANBAN_END),height+margin.bottom,"rasterLine");
	//vertical LANEBOX_RIGHT_START
	_drawLine(gGuides,LANE_LABELBOX_RIGHT_START,0-margin.top,LANE_LABELBOX_RIGHT_START,height+margin.bottom,"rasterLine");
	//vertical LANEBOX_RIGHT_END
	_drawLine(gGuides,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH,0-margin.top,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH,height+margin.bottom,"rasterLine");

	//vertical LANEBOX_RIGHT_END PILLAR
	if (LANE_LABELBOX_RIGHT_WIDTH-PILLAR_X_OFFSET>100)
		_drawLine(gGuides,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH-PILLAR_X_OFFSET,0-margin.top,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH-PILLAR_X_OFFSET,height+margin.bottom,"rasterLine");

	//vertical METRIC FORECAST2
	_drawLine(gGuides,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH+METRIC_WIDTH,0-margin.top,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH+METRIC_WIDTH,height+margin.bottom,"rasterLine");

	//vertical METRIC GOAL
	_drawLine(gGuides,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH+(2*METRIC_WIDTH),0-margin.top,LANE_LABELBOX_RIGHT_START+LANE_LABELBOX_RIGHT_WIDTH+(2*METRIC_WIDTH),height+margin.bottom,"rasterLine");

	d3.select("#guides").style("visibility","hidden");
	if (BOARD.viewConfig.guides=="show"){
		d3.select("#guides").style("visibility","visible");
	}


}



function drawVersion(){
	d3.select("#version").remove()
	console.log("####removed #version");

	var _line =7;
	var _offset =8;
	var _y=height+TIMELINE_HEIGHT+20;
	//if (SHOW_METRICS_FORECAST1 || SHOW_METRICS_FORECAST2 || SHOW_METRICS_GOAL) _y=height+TIMELINE_HEIGHT;

	var _xOffset=(SHOW_METRICS_FORECAST1*150)+(SHOW_METRICS_FORECAST2*150)+(SHOW_METRICS_GOAL*120)+150;

	var _x = x(KANBAN_END)+TARGETS_COL_WIDTH+LANE_LABELBOX_RIGHT_WIDTH+_xOffset;

	var t;

	var gVersion= svg.append("g")
		.attr("id","version");

	_drawXlink(gVersion,"#bpty",(_x-40),(_y-15),{"scale":.4});

	_drawLegendLine(gVersion,(_x-50),(_x+90),_y);

	//title
	var i=0;

	t = [	{"name":"context: ","value": CONTEXT},
			{"name":"owner: ","value": "joachim baca"},
			{"name":"classification: ","value": "confidential"},
			{"name":"URL: ","value": document.URL},
			{"name":"version: ","value": new Date().toString('yyyy-MM-dd_hh:mm:ss')},
			{"name":"author: ","value":"@cactus | twitter.com/gkathan"}
		];

	var _yRunning;
	for (var j in t){
		_yRunning = _y+_offset+(j*_line);
		_drawVersionText(gVersion,t[j],_x,_yRunning,6);
	}
	//bottom disclaimer
	_yRunning+=5;
	_drawLegendLine(gVersion,(_x-50),(_x+90),_yRunning);

	_drawText(gVersion,"* auto-generated D3 svg | batik png pdf transcoded",(_x+90),_yRunning+7,{"size":"5px", "weight":"normal","anchor":"end"});
}

/**
 */
function _drawVersionText(svg,text,x,y,size){

	_drawText(svg,text.name,x-15,y,{"size":size-1, "weight":"normal","anchor":"end"});
	_drawText(svg,text.value,x+3,y,{"size":size, "weight":"normal","anchor":"start"});
}


function drawLegend(){
	var _line =7;
	var _offset =28;
	var _y = height+TIMELINE_HEIGHT;
	var _fontsize=4;

	_x=-margin.left+20;

	var t;

	var gLegend= svg.select("#version")
		.append("g")
		.attr("id","legend");

	var _style = {"size":_fontsize, "weight":"normal","anchor":"start","style":"italic"}

	_drawXlink(gLegend,"#item",_x,(_y+2),{"scale":.3});
	_drawText(gLegend,"... corporate initiative [planned finish]",_x+12,(_y+7),_style);

	_drawXlink(gLegend,"#tactic",_x,(_y+11),{"scale":.3});
	_drawText(gLegend,"... tactical initiative [planned finish]",_x+12,(_y+16),_style);

	_drawXlink(gLegend,"#innovation",_x,(_y+20),{"scale":.3});
	_drawText(gLegend,"... innovation initiative [planned finish]",_x+12,(_y+25),_style);


	_drawXlink(gLegend,"#item",_x,(_y+29),{"scale":.3});

	_drawXlink(gLegend,"#postit_yellow",_x,(_y+27),{"scale":.35});
	_drawText(gLegend,"... fuzzy initiative [planned finish]",_x+12,(_y+34),_style);

	_drawXlink(gLegend,"#postit_blue",_x,(_y+36),{"scale":.35});
	_drawText(gLegend,"... custom note",_x+12,(_y+43),_style);

	_drawXlink(gLegend,"#target",_x,(_y+45),{"scale":.35});
	_drawText(gLegend,"... pulling goal",_x+12,(_y+52),_style);


	gLegend.append("circle").attr("r",10)
		.style("fill","green")
		.style("opacity",0.5)
		.attr("transform","translate ("+(_x+4)+","+(_y+57)+") scale(0.30) ");

	_drawText(gLegend,"... initiative [done]",(_x+12),(_y+59),_style);

	gLegend.append("circle").attr("r",10)
		.attr("transform","translate ("+(_x+4)+","+(_y+64)+") scale(0.30) ")
		.style("opacity",0.5)
		.style("fill","red");
	_drawText(gLegend,"... initiative [delayed]",(_x+12),(_y+66),_style);

	gLegend.append("circle").attr("r",10)
		.style("opacity",0.5)
		.style("fill","gold")
		.attr("transform","translate ("+(_x+4)+","+(_y+71)+") scale(0.30) ");
	_drawText(gLegend,"... initiative [planned]",(_x+12),(_y+72),_style);

	gLegend.append("circle").attr("r",10)
		.style("opacity",0.5)
		.style("fill","grey")
		.attr("transform","translate ("+(_x+4)+","+(_y+78)+") scale(0.30) ");
	_drawText(gLegend,"... initiative [future]",(_x+12),(_y+80),_style);

	_drawLegendLine(gLegend,_x-5,_x+100,_y);

}


/**
 */
function _drawLegendLine(svg,x1,x2,y){
	_drawLine(svg,x1,y,x2,y,"legendLine");
}


function customAxis(g) {
  g.selectAll("text")
      .attr("x", 4)
      .attr("dy", -4);
}
