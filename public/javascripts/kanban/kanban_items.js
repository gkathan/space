/** NG version (2.0) based on node.js express and new data structures
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */

//the data as it is read on init = flat JSON table
var initiativeData;
// depending on context we filter this data for every view
var filteredInitiativeData;
// hierarchical data enriched with y-coords based on lanestructure
var itemTree;
//top root parent of nested item hierarchy
var NEST_ROOT="root";
// nest -level
var ITEMDATA_NEST;
var ITEMDATA_FILTER;
//depth level
// set in createLaneHierarchy()
var ITEMDATA_DEPTH_LEVEL;
/**
 * the values in the override mean % of space the lanes will get => has to sum to 100%
 */
var itemDataConfig;
/**
 * "auto": takes the sum of subitems as basline and calculates the distribution accordingly - the more items the more space
 * "equal": takes the parent length of elements and calculates the equal distributed space (e.g. lane "bwin" has 4 sublanes => each sublane gets 1/4 (0.25) for its distribution
 * "override": takes specified values and overrides the distribution with those values => not implemented yet ;-)
 */
// scaling of graphical elements (itemblock,circle, circle icon)
// => differs per view /context => currently hacked in kanban.js e.g. drawBC()
var ITEM_SCALE=0.8;
var ITEM_FONTSCALE=1.5;
// when to wrap name of item
var ITEM_TEXT_MAX_CHARS = 100;
var ITEM_TEXT_SWAG_MAX_CHARS =20;

// the relative scaling compared to ITEM
// if set to 1 = TACTICS are in same SIZE than corp ITEMS
// if set to e.g. 0.5 TACTICS are half the size
var TACTIC_SCALE=0.9;
// PLAN or ACTUAL => defines whether text is below circle or icon
//var ITEM_TEXT_POSITION ="PLAN"
var ITEM_TEXT_POSITION ="ACTUAL"
//on item doubleclick
var ITEM_ISOLATION_MODE = false;

// ----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- ITEMS SECTION ---------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

function _getVisibility(element){
		var _visibility="visible";
		if (element=="drawItemName.end" && BOARD.viewConfig.start=="show") _visibility="hidden";
		if (element=="drawItemName.start" && BOARD.viewConfig.start=="hide") _visibility="hidden";

		if (element=="itemIcon" && BOARD.viewConfig.start=="show") _visibility="hidden";
		if (element=="itemIcon" && BOARD.viewConfig.start=="hide") _visibility="visible";

		return _visibility;
}

/** renders the items
*/
function drawItems(){
	d3.selectAll("#initiatives,#dependencies,#sizings").remove();
	tooltip.attr("class","itemTooltip");

	svg.append("g").attr("id","dependencies");
	var gSizings = svg.append("g")
	.attr("id","sizings")
	.style("opacity","0");

	//initiatives groups
	var gItems = svg.append("g").attr("id","initiatives").append("g").attr("id","items");

	//labels
	var gLabels = gSizings.append("g")
		.attr("id","labels")
		.style("opacity",0);

	filteredInitiativeData = initiativeData.filter(function(d){
	var _filterStart=(new Date(d.planDate)>=KANBAN_START ||new Date(d.actualDate)>=KANBAN_START);
	var _filterEnd=new Date(d.planDate)<=KANBAN_END;
	return _filterStart && _filterEnd;
	});

	var groups = gItems.selectAll("items")
	// filter data if ITEMDATA_FILTER is set
	.data(filteredInitiativeData)
	.enter()
	// **************** grouped item + svg block + label text
	.append("g")
	.attr("id",function(d){return "item_"+d.id})
	.each(function(d){
		var _size = d.size*ITEM_SCALE;
		if (!d.isCorporate) _size = _size * TACTIC_SCALE;

		console.log("** item: id="+d.id+"."+d.name+" FQName(): "+getFQName(d));

		var _itemXPlanned;
		var _itemXActual;
		var _itemXStart;
		var _itemX;

		if (d.state=="planned" && new Date(d.actualDate)<=TODAY){
			_itemX = x(TODAY);
			//_itemXActual = x(TODAY);
			//d.state="delayed";
			d.actualDate = yearFormat(TODAY);
		}
		_itemXPlanned = x(new Date(d.planDate));
		_itemXActual = x(new Date(d.actualDate));
		_itemXStart = x(new Date(d.startDate));


		if (!d.actualDate) _itemX =_itemXPlanned;
		else _itemX = _itemXActual

		var _yOffset = getSublaneCenterOffset(getFQName(d));
		var _sublane = getSublaneByNameNEW(getFQName(d));
		var _sublaneHeigth = _sublane.yt2-_sublane.yt1;
		var _itemY = y(_sublane.yt1-_yOffset)+getInt(d.sublaneOffset);
		// ------------  line if delayed  before plan--------------
		var _lineX1= _itemXPlanned;
		var _lineX2= _itemX-_size-(_size/2);
		// flags whether elements are beyond KANBAN_END, KANBAN_START (in case of timemachine or delays)
		var _endBeyond=false;
		var _startBeyond=false;
		var _endActualBeyond=false;
		var _startActualBeyond=false;

		if (new Date(d.planDate) < KANBAN_START){
			 _lineX1 = x(KANBAN_START)+3;
			 _startBeyond=true;
		 }
		if (new Date(d.actualDate) < KANBAN_START){
			 _startBeyond=true;
		}

		if (new Date(d.actualDate) > KANBAN_END){
			 _lineX2 = x(KANBAN_END)-3;
			 _endActualBeyond=true;
		}
		if (new Date(d.actualDate) > KANBAN_END){
			 _startActualBeyond=true;
		}

		var _color;
		if (d.status) _color=CONFIG.initiatives.states.colors[d.status];

		// ----------------- startDate indicator ---------------------
		if(d.startDate){
			console.log("____startDate: "+d.startDate+" item: "+d.name+" plan: "+d.planDate);
			var _startVisibility ="hidden";
			if (BOARD.viewConfig.start=="show"){
				_startVisibility="visible";
			}
			var _start = d3.select(this).append("g").attr("id","startID_"+d.id).style("visibility",_startVisibility);
			var _startX1 = _itemXStart;
			var _startX2 = _itemXPlanned;

			var _x1Beyond = false;
			var _x2Beyond = false;
			if (new Date(d.startDate)<=KANBAN_START){
				_startX1=x(KANBAN_START);
				_x1Beyond = true;
			}
			else if (new Date(d.actualDate)>KANBAN_END){
				_startX2=x(KANBAN_END);
				_x2Beyond = true;

			}
			_drawStartDateIndicator(_start,d,{x1:_startX1,x1Beyond:_x1Beyond,x2:_startX2,x2Beyond:_x2Beyond,y:_itemY},_size,_color);

		}


		if (d.state =="done" || d.state =="planned"){
			if (d.actualDate>d.planDate) _drawItemDelayLine(d3.select(this),_lineX1,_lineX2,_itemY);
			// ------------  line if before plan--------------
			else if (d.actualDate<d.planDate) _drawItemDelayLine(d3.select(this),_itemX,(_itemXPlanned-_size-(_size/2)),_itemY);

			d3.select(this)
				.style("opacity",d.accuracy/10);

			// ------------  circles --------------
			if (d.Type !=="target"){
				// only draw circle if we are inside KANBAN_START/END
				if (!_startActualBeyond && !_endBeyond){
					d3.select(this)
						.append("circle")
							.attr("id","item_circle_"+d.id)
							.attr("cx",_itemX)
							.attr("cy",_itemY)
							.attr("r",_size)
							.style("visibility","visible")//_getVisibility("itemIcon"))
							.attr("class",function(d){
							if (d.actualDate>d.planDate &&d.state=="planned") {return "delayed"}
							else if (new Date(d.actualDate)>WIP_END) {return "future";}
							else {return d.state}})

					// ----------- circle icons -------------
					// only append icon if we have declared on in external.svg
					if (document.getElementById("icon_"+d.theme+"."+d.lane+"."+d.sublane)){
						_drawXlink(d3.select(this),"#icon_"+d.theme+"."+d.lane+"."+d.sublane,(_itemX-(1.2*_size/2)),(_itemY-(1.2*_size/2)),{"scale":_size/10},"item_circleicon_"+d.id);
					}
				}
			} //end if d.Type!="target"

		}//end kill check

		// ------------  item blocks & names & postits --------------
		// if isCorporate flag is not set use "tactic" icon
		if (new Date(d.planDate) >KANBAN_START){
			var _iconRef=d.Type;
			if (!d.isCorporate) {
				_iconRef = "tactic";
			}

			if (!d.ExtId) _iconRef="item_notsynced";
			if (d.status=="Understanding" || d.status=="New" || d.status=="Conception") _iconRef="item_grey";
			if (d.state=="onhold") _iconRef="item_grey";

			if (d.state=="done") _iconRef="item_green";
			if (d.state=="planned" && new Date (d.planDate) < new Date(d.actualDate)) _iconRef="item_red";
			if (d.state=="killed") _iconRef="item_killed";

			var _diff = new Date()-new Date(d.createDate);
			// 24 hours are NEW ...
			if ( Math.floor(_diff/(60*60*1000))< 24) _iconRef="item_new";

			_drawXlink(d3.select(this),"#"+_iconRef,(_itemXPlanned-(1.2*_size)),(_itemY-(1.2*_size)),{"scale":_size/10,"visibility":_getVisibility("itemIcon")},"item_icon_"+d.id);

			// positioning of itemtext
			var _textX;

			if (ITEM_TEXT_POSITION=="ACTUAL" && (d.state=="planned" || d.state=="done"))_textX=_itemXActual;
			if (ITEM_TEXT_POSITION=="PLAN") _textX=_itemXPlanned;

			_drawItemName(d3.select(this),d,_textX,(_itemY)+ parseInt(_size)+(5+(_size/5)*ITEM_FONTSCALE),null,null,_getVisibility("drawItemName.end"),"end");
			// kanban_postits.js
			_drawPostit(d3.select(this),d);
		} // end KANBAN_START check
		// if plandate is beyon KANBAN_START - we have to draw the name below the circle (a bit smaller)
		else if (new Date(d.actualDate)>KANBAN_START && (d.state =="done" || d.state =="planned")){
			_drawItemName(d3.select(this),d,_itemXActual,(_itemY+_size+3),0.1,null,_getVisibility("drawItemName.end"),"end");
		}
		// transparent circle on top for the event listener
		if (d.state!="killed") _drawItemEventListenerCircle(d3.select(this),"event_circle_"+d.id,_itemX,_itemY,_size)
		// and always over the planned block
		_drawItemEventListenerCircle(d3.select(this),"event_planned_circle_"+d.id,_itemXPlanned,_itemY,_size)

		// ------------- labels for Swag view -------------
		_text = gLabels
		   .append("text")
		   .attr("id","label_"+d.id)
		   //.text(d.name)
		   .style("font-size",5+d.Swag/500+"px")
		   //.style("font-weight","bold")
		   .attr("text-anchor","middle")
		   .attr("x",_itemXPlanned)
		   .attr("y",_itemY);

		textarea(_text,d.name,_itemXPlanned,_itemY,ITEM_TEXT_SWAG_MAX_CHARS,(5+d.Swag/500));

		// ------------  dependencies --------------
		if (!isNaN(parseInt(d.dependsOn))){
			console.log("============================== "+d.id+" depends on: "+d.dependsOn);

			var _dependingItems = d.dependsOn.split(",");
			console.log("depending items: "+_dependingItems);

			// by default visibility is hidden
			var dep = d3.select("#dependencies")
					.append("g")
					.attr("id","depID_"+d.id)
					.style("visibility","hidden");

			for (var j=0;j<_dependingItems.length;j++) {
				var _d=_dependingItems[j];
				//lookup the concrete item
				var _dependingItem = getItemByID(filteredInitiativeData,_d);
				if (_dependingItem){
					var _depYOffset = getSublaneCenterOffset(getFQName(_dependingItem));
					//console.log("found depending item id: "+_dependingItem.id+ " "+_dependingItem.name);
					var _toX = x(new Date(_dependingItem.planDate))
					var _toY = y(getSublaneByNameNEW(getFQName(_dependingItem)).yt1-_depYOffset)+getInt(_dependingItem.sublaneOffset);

					// put lines in one layer to turn on off globally
					_drawLine(dep,_itemXPlanned,_itemY,_toX,_toY,"dependLine",[{"end":"arrow_grey"}]);
				}
			} // end for loop
			//console.log ("check depending element: "+d3.select("#item_block_"+d.dependsOn).getBBox());
		} // end if dependcies

		// ----------------- sizings --------------------------------

		// sizingPD portfolio view
		if(d.Swag){
			d3.select("#sizings")
			.append("circle")
			.attr("cx", _itemXPlanned)
			.attr("cy", _itemY)
			.attr("r", d.Swag/100)
			.attr("class","sizings "+d.lane)
			.style("opacity",0.4);
		}
		// drag & drop  test	==>  HUHUUUUU - this overrides the itemdata binding !
		//d3.select(this).data([ {"x":0, "y":0, "lane":d.lane,"id":d._id} ]).call(drag_item);
		//for drag&drop
		if (getAUTH()=="admin"){
			var drag_item = _registerDragDrop();
			d.x=0;
			d.y=0;
			d3.select(this).call(drag_item);
		}
	}) //end each()
} //end drawItems

function _drawItemEventListenerCircle(svg,id,x,y,r){
	svg.append("circle")
		.attr("id",id)
		.attr("cx",x)
		.attr("cy",y)
		.attr("r",r)
		.style("opacity",0)
		.on("mouseover", function(d){onTooltipOverHandler(d,tooltip);})
		.on("mousemove", function(d){onTooltipMoveHandler(tooltip);})
		.on("dblclick",	function(d){onTooltipDoubleClickHandler(tooltip,d3.select(this),d);})
		.on("mouseout", function(d){onTooltipOutHandler(d,tooltip);})
}

/**
 * helper methode
 */
function _drawItemName(svg,d,x,y,scale,color,visibility,context,anchor){
	// ------------  item names --------------
	var _anchor ="middle";
	if (anchor) _anchor=anchor;

	if (!scale) scale=1;
	var size = d.size*ITEM_SCALE*scale;
	var _textWeight="bold";
	var _textStyle="normal";
	var _textSize = 4.5+(size/8)*ITEM_FONTSCALE;
	if (!d.isCorporate && !d.Type=="target") {
		_textWeight = "normal";
		_textStyle="italic";
		_textSize =_textSize * TACTIC_SCALE;
	}
	var _textDecoration="";
	//if (d.ExtId!="") _textDecoration="underline";


	var _name = d.name.replace(/\s*\[.*?\]\s*/g, '');

	var _text =svg.append("text")
			.attr("id","text_"+context+"_"+d.id)
	   .style("font-size",_textSize+"px")
		.style("visibility",visibility)
	   .style("text-anchor",_anchor)
	   // !!!!! BOLD and anchor=MIDDLE is not correctly renderered by batik !!!!!
	   //.style("font-weight",_textWeight)
	   .style("font-style",_textStyle)
	   .style("text-decoration",_textDecoration)
	   .style("kerning",-0.25)
	   //.style("letter-spacing",-.2)
	   //google font
	   .style("font-family","arial, sans-serif")
	   .style("fill",function(d){
								if ((d.actualDate>d.planDate && d.state!="done" &&d.state!="killed"&&d.state!="onhold")) return "red";
								else if (d.state=="done") return "green";
								else if (d.state=="todo" || d.state=="killed" || d.state=="onhold" ||!d.ExtId) return "#aaaaaa";
								else if (d.Type=="target") return COLOR_TARGET;
								return"black";})
	   .attr("x",x)
	   .attr("y",y)
	   //.text(d.name);
		textarea(_text,_name,x,y,ITEM_TEXT_MAX_CHARS,_textSize-1);
}


/**
 */
function _drawItemDelayLine(svg,x1,x2,y){
	svg
	.append("line")
	.attr("x1", x1)
	.attr("y1", y)
	.attr("x2", x2)
	.attr("y2", y)
	.attr("class", function(d){
		if (d.actualDate>d.planDate &&(d.state=="planned" ||d.state=="todo") ) return "delayLine";
		else if (d.actualDate>d.planDate &&d.state=="onhold") return "delayLineOnhold";
		else {return "delayLineDone"}})

	.attr("marker-end", function(d){
		if (d.actualDate>d.planDate &&(d.state=="planned"||d.state=="todo")) return "url(#arrow_red)";
		else if (d.actualDate>d.planDate &&d.state=="onhold") return "url(#arrow_grey)";

		else {return "url(#arrow_green)"}});
}

/**
* 			_drawStartDateIndicator(_start,d,{x1:_startX1,x1Beyond:_x1Beyond,x2:_startX2,x2Beyond:_x2Beyond,y:_itemY},_size,_color);
*/
function _drawStartDateIndicator(svg,item,position,size,color){
	var _color;
	if (!color){
		_color="url(#gradientblack)";
	}
	else{
		_color=color;
	}
	var _width = (position.x2-position.x1);
	if (_width<0) _width = 0;

	var _height = size;
	if (_height<0) _height = 0;

	svg.append("rect")
	.attr("x", position.x1)
	.attr("y", position.y-size/2)
	.attr("width", _width)
	.attr("height", _height)
	.style("fill",_color)
	.style("opacity",1)
		.on("mouseover", function(d){onTooltipOverHandler(d,tooltip);})
		.on("mousemove", function(d){onTooltipMoveHandler(tooltip);})
		.on("dblclick",	function(d){onTooltipDoubleClickHandler(tooltip,d3.select(this),d);})
		.on("mouseout", function(d){onTooltipOutHandler(d,tooltip);});

	if (!position.x1Beyond){
		svg.append("circle")
		.attr("cx", position.x1)
		.attr("cy", position.y)
		.attr("r", size/2)
		.style("stroke-width","0px")
		//.style("stroke","black")
		.style("fill",_color)
		.style("opacity",1);
	}

	if (!position.x2Beyond){
		svg.append("circle")
		.attr("cx", position.x2)
		.attr("cy", position.y)
		.attr("r", size/2)
		.style("stroke-width","0px")
		//.style("stroke","black")
		.style("fill",_color)
		.style("opacity",1);
	}
	/*
	svg.append("path").
	attr("transform","translate("+(position.x1+1)+","+position.y+") rotate(90) scale(0.5)")
	.attr("d",d3.svg.symbol().type("triangle-up"))
	.style("fill","white");
	*/
	var _textX=position.x1+((position.x2-position.x1)/2);
	var _anchor="middle";
	if (position.x1Beyond){
		_textX=x(KANBAN_START)+((position.x2-x(KANBAN_START))/2);
		_anchor="start";
		if(_textX<x(KANBAN_START)){
			 _textX=x(KANBAN_START);
		}
	}
	_drawItemName(svg,item,_textX,(position.y+size+4), 1,null,_getVisibility("drawItemName.start"),"start",_anchor);
}

/**
 * handler for tooltip mouse over
 * called within item rendering
 * => is currently doing stuff for items AND targets !!!
 * quite crappy.....
 */
function onTooltipOverHandler(d,tooltip){
	// and fadeout rest
	var highlight ="#item_";

	//bugfix
	var _tooltipCSS = d.Type+"Tooltip";
	if (d.Type=="innovation") _tooltipCSS= "itemTooltip";

	tooltip.attr("class",_tooltipCSS);

	d3.select("#item_circle_"+d.id)
	.transition().delay(0).duration(500)
	.attr("r", d.size*ITEM_SCALE*2);
	//.style("cursor","pointer");

	// and the transparent event circle
	d3.select("#event_circle_"+d.id)
	.transition().delay(0).duration(500)
	.attr("r", d.size*ITEM_SCALE*2)
	.style("cursor","pointer");

	d3.select("#vision").transition().delay(0).duration(500).style("opacity",0.1);

	d3.selectAll("#items").selectAll("g")
		.transition()
		.delay(0)
		.duration(500)
		.style("opacity",0.1);

	// dim metrics
	d3.select("#metrics").selectAll("[id*=metric_]").transition().delay(0).duration(500).style("opacity",0.1)
	// and highlight depending metrics
	//test hardcoded

	d3.select(highlight+d.id)
		.transition()
		.delay(100)
		.duration(500)
	.style("opacity",1);

	d3.select("#startID_"+d.id)
		.transition()
		.delay(100)
		.duration(500)
	.style("opacity",1);


	console.log("highlight"+highlight+d.id);

	tooltip.html(_itemTooltipHTML(d));

	tooltip.style("visibility", "visible");
	tooltip.style("top", (d3.event.pageY-40)+"px").style("left",(d3.event.pageX+25)+"px");

	var _dependingItems;
	if (d.dependsOn){
		// highlight also depending items
		_dependingItems = d.dependsOn.split(",");
	}
	// in case of targets
	if (d.initiatives){
		// highlight also depending items
		_dependingItems = d.initiatives.split(",");
	}

	if (_dependingItems) _highlightItems(_dependingItems,filteredInitiativeData,"#item_");
	if (d.startDate){
		d3.select("#startID_"+d.id).style("visibility","visible");
		d3.select("#text_end_"+d.id).style("visibility","hidden");
		d3.select("#text_start_"+d.id).style("visibility","visible");
	}
}


function _highlightItems(items,data,type){
		for (var j=0;j<items.length;j++) {
			var _di = items[j];

			var _item = getItemByID(data,_di);

			if (_item){
				var dep=d3.select(type+_di)
					.transition()
					.delay(200)
					.duration(500)
					.style("opacity",1);
			}
		}// end check depending items
}


/** returns HTML for item tooltip content
 */
function _itemTooltipHTML(d){
	//[TODO] fix the indicator dynmic color bar  and overall table mess here ;-)
	var _indicator;
	if (d.actualDate>d.planDate &&d.state=="planned") _indicator="red";
	else if (d.actualDate>d.planDate &&d.state=="onhold") _indicator="grey";

	else if (d.state=="done") _indicator ="green";
	else if (d.state=="planned") _indicator ="gold";

	var _health;
	if (d.health=="green") _health="green";
	else if (d.health=="amber") _health ="gold";
	else if (d.health=="red") _health ="red";

	var _v1Link = V1_PROD_URL+"Epic.mvc/Summary?oidToken=Epic%3A";
	var _v1SyncLink= "v1sync.php?_id="+d._id;
	var _adminLink = "admin.php?type=initiatives&_id="+d._id;

	var _lanepath = d.lanePath;

	var _htmlBase ="<table><col width=\"30\"/><col width=\"85\"/><tr><td style=\"font-size:4px;text-align:left\"><a href=\""+_v1SyncLink+"\" target=\"new\">[v1synch]</a> <a href=\""+_adminLink+"\" target=\"new\">[admin]</a></td><td style=\"font-size:4px;text-align:right\">";
	if (d.ExtId)
		_htmlBase+=" <a href=\""+_v1Link+d.ExtId+"\" target=\"new\">[v1: "+d.ExtId+"]</a>";
	_htmlBase+="</td></tr>";
	_htmlBase+="<tr class=\"header\" style=\"height:4px\"/><td colspan=\"2\"><div class=\"indicator\" style=\"background-color:"+_indicator+"\">&nbsp;</div><b style=\"padding-left:4px;font-size:7px\">"+d.name +"</b></td></tr>"+(d.name2 ? "<tr><td class=\"tiny\">title2:</td><td  style=\"font-weight:bold\">"+d.name2+"</td></tr>" :"");
	_htmlBase+="<tr><td class=\"tiny\"style=\"width:20%\">lane:</td><td><b>"+_lanepath+"</b></td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">owner:</td><td><b>"+d.productOwner+"</b></td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">Swag:</td><td><b>"+d.Swag+" PD</b></td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">started:</td><td><b>"+d.startDate+"</b></td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">planned:</td><td><b>"+d.planDate+"</b></td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">v1.status:</td><td class=\"bold\">"+d.status+"</td></tr>";
	_htmlBase+="<tr><td class=\"tiny\">k.state:</td><td class=\"bold\">"+d.state+"</td></tr>";

	if (d.actualDate>d.planDate &&d.state!="done"){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">delayed:</td><td><b>"+diffDays(d.planDate,d.actualDate)+" days</b></td></tr>";
	}
	else if (d.actualDate>d.planDate &&d.state=="done"){
		_htmlBase=_htmlBase+ "<tr><td class=\"tiny\">done:</td><td><b>"+d.actualDate+"</b> </td></tr><tr><td class=\"small\">delay: </td><td><b>"+diffDays(d.planDate,d.actualDate)+" days</b></td></tr>";
	}
	else if (d.state=="done"){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">done:</td><td><b>"+d.actualDate+"</b> </td></tr>";
	}
	else if (d.state=="todo"){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">DoR:</td><td class=\"small\" style=\"text-align:left\">"+d.DoR+"</td></tr>";

	}
	if (d.health!=""){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">health:</td><td><div class=\"health\" style=\"background-color:"+_health+"\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></td></tr>";
	}
	if (d.healthComment!=""){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">comment:</td><td class=\"small\" style=\"text-align:left\">"+d.healthComment+" </td></tr>";
	}
	if (d.programLead!=""){
		_htmlBase=_htmlBase+"<tr><td class=\"tiny\">lead:</td><td><b>"+d.programLead+"</b> </td></tr>";
	}
	_htmlBase=_htmlBase+"<tr><td class=\"tiny\">DoD:</td><td class=\"small\" style=\"text-align:left\">"+d.DoD+"</td></tr>";
	_htmlBase = _htmlBase+"<tr> <td colspan=\"2\"  style=\"text-align:right\"><a id=\"flip\" class=\"small\" style=\"text-align:right\" >[flip it]</a></td></table>";

	return _htmlBase;
}

/**
 * handler for tooltip mouse move
 * called within item rendering
 */
function onTooltipMoveHandler(tooltip){
	return tooltip.style("top", (d3.event.pageY-40)+"px").style("left",(d3.event.pageX+25)+"px");
}

/**
 * handler for tooltip doubleclick handling
 */
function onTooltipDoubleClickHandler(tooltip,svg,d){
	console.log("doubleclick: "+d3.select(this)+" svg: "+svg);
	if (!ITEM_ISOLATION_MODE){
		d3.selectAll("#items,#targets").selectAll("g").selectAll("circle").on("mousemove",null);
		d3.selectAll("#items,#targets").selectAll("g").selectAll("circle").on("mouseout",null);
		d3.selectAll("#items,#targets").selectAll("g").selectAll("circle").on("mouseover",null);

		d3.selectAll("#metrics,#queues,#lanes,#version,#axes").style("opacity", .5);

		ITEM_ISOLATION_MODE=true;
		console.log("...in ITEM_ISOLATION mode...");
		var _x = get_metrics(svg.node()).x-margin.left;
		var _y = get_metrics(svg.node()).y-margin.top;
		console.log("...x: "+_x+"  y: "+_y);

		//d3.select("#item_"+d.id).append("text").attr("id","isolationtext").text("ISOLATION MODE").style("font-size","6px").style("fill","grey").attr("x",_x).attr("y",_y).style("text-anchor","middle");;

		d3.select("#flip").on("click", function(){
				var front = document.getElementById('tooltip');

				// -- experiment with diff_trail from initiatives
				var _diff_trail;
				$.when($.getJSON(dataSourceFor("initiatives_diff_trail")+"/"+d._id)
					.done(function(initiatives_diff_trail){

						_diff_trail=initiatives_diff_trail;
						//else throw new Exception("error loading diff_trail")
						var back_content="change trail:";

						var _diff="";
						for (var d in _diff_trail){
							//_diff+="<div style=\"font-size:6px\">"+JSON.stringify(_diff_trail[d].diff)+"</div>";
							// do not look at _id and changeDate
							for (var c in _diff_trail[d].diff){
								if (c!="_id" &&c!="changeDate"&&c!="createDate")
									_diff+="<div style=\"font-size:6px\">"+_diff_trail[d].timestamp+"<br><b>* "+c+": "+JSON.stringify(_diff_trail[d].diff[c])+"</b></div>";
							}
						}
						back_content += _diff+"<br><a id=\"flip_close\" class=\"small\" style=\"text-align:left\" >[flip back]</a>"; // Generate or pull any HTML you want for the back.
						console.log("...flip...");
						// when the correct action happens, call flip!
						back = flippant.flip(front, back_content);

						d3.select("#flip_close").on("click", function(){
							back.close();
						});
					}));
				// -- experiment with diff_trail from initiatives
			});
	}
	else {
		if (back) back.close();

		d3.selectAll("#items").selectAll("g").selectAll("circle").on("mousemove", function(d){onTooltipMoveHandler(tooltip);})
		d3.selectAll("#items").selectAll("g").selectAll("circle").on("mouseout", function(d){onTooltipOutHandler(d,tooltip);})
		d3.selectAll("#items").selectAll("g").selectAll("circle").on("mouseover", function(d){onTooltipOverHandler(d,tooltip);})


		console.log("...EXIT ITEM_ISOLATION mode...");
		ITEM_ISOLATION_MODE=false;
		d3.selectAll("#metrics,#queues,#lanes,#version,#axes").style("opacity",1);
		d3.select("#isolationtext").remove();
		d3.selectAll("#highlightlane").remove();
	}
}


/**
 * handler for tooltip mouse out
 * called within item rendering
 */
function onTooltipOutHandler(d,tooltip){
	tooltip.style("visibility", "hidden");

	var highlight ="#item_";
	if (d.Type=="target") highlight="#target_";

	d3.select("#item_circle_"+d.id)
		.transition().delay(0).duration(500)
		.attr("r", d.size*ITEM_SCALE);
			//.transition().delay(0).duration(500)

	d3.select("#event_circle_"+d.id)
		.transition().delay(0).duration(500)
		.attr("r", d.size*ITEM_SCALE);
			//.transition().delay(0).duration(500)

	d3.select("#vision").transition().delay(0).duration(500).style("opacity",1);

	// show metrics
	d3.select("#metrics").selectAll("[id*=metric_]").transition().delay(0).duration(500).style("opacity",1)

	d3.select("#depID_"+d.id)
		.transition()
		.delay(200)
		.duration(500)
		.style("visibility","hidden");

	//set all back to full visibility /accuracy
	d3.selectAll("#items").selectAll("g")
		.transition()
		.delay(100)
		.duration(500)
		//.style("opacity",d.accuracy/10);
		.style("opacity",1);

	d3.select(highlight+d.id)
		.transition()
		.delay(0)
		.duration(100)
		.style("opacity",d.accuracy/10);

	if (d.dependsOn){
		// de.highlight also depending items
		var _dependingItems = d.dependsOn.split(",");

		for (var j=0;j<_dependingItems.length;j++) {
			var _di = _dependingItems[j];

			var _item = getItemByID(filteredInitiativeData,_di);

			if (_item){

			var dep=d3.select("#item_"+_di)
			dep.selectAll("circle")
				.transition()
				.delay(0)
				.duration(500)
				.attr("r", _item.size*ITEM_SCALE);
			}
		} // end de- check depending items
	}

	if (BOARD.viewConfig.start=="hide"){
		if (d.startDate) d3.select("#startID_"+d.id).style("visibility","hidden");
		d3.select("#text_end_"+d.id).style("visibility","visible");
		d3.select("#text_start_"+d.id).style("visibility","hidden");
	}

}

/** drag drop handler for items...
 *
 */
function _registerDragDrop(){
	// test drag item start
	var baseY;

		var drag_item = d3.behavior.drag()
			.on("dragstart", function(d,i) {

				if(ITEM_ISOLATION_MODE){
					d3.select(this).style("opacity",0.4);
					movedX=0;
					movedY=0;
					baseY = get_metrics(d3.select(this).node()).y;
					console.log("dragstart= d.x: "+d.x+" - d.y: "+d.y+" metrics:"+baseY);
					d3.select(this).attr("transform", function(d,i){
						return "translate(" + [ d.x,d.y ] + ")"
					})
					// and highlight the sublane we are in
					var _item = getItemByKey(initiativeData,"_id",d._id);
					var _sublane = getSublaneByNameNEW(_item.lanePath);
					console.log(">>>> highlight sublane: "+_sublane.name);
					highlightLane(d3.select("#lanes"),_sublane);
				}
			})

			.on("drag", function(d,i) {
				if(ITEM_ISOLATION_MODE){
					//d.x += d3.event.dx
					d.y += d3.event.dy

					movedX += d3.event.dx
					movedY += d3.event.dy

					//item
					d3.select(this).attr("transform", function(d,i){
						return "translate(" + [ d.x,d.y ] + ")"
					})
					// and the tooltip
					var _y =tooltip.style("top").split("px")[0];
					var _ymoved = getInt(_y)+getInt(d3.event.dy);
					tooltip.style("visibility","hidden");
					tooltip.style("top",_ymoved+"px");
					// watch sublane change
					var _item = getItemByKey(initiativeData,"_id",d._id);
				}
			})

			.on("dragend",function(d,i){
				if(ITEM_ISOLATION_MODE){

					d3.selectAll("#highlightlane").remove();
					console.log("dragend event: x="+d.x+", y="+d.y+"..."+d.lane);
					tooltip.style("visibility","visible");

					// check y drop coordinates whetrher they are within lane spectrum
					var _lane;
					// currently lane is the one layer on top of sublane
					// d.lanepath = theme/lane/sublane
					// => so we just cut one level from bottom
					// _.initial returns array without last element
					// join flattens back to string
					var _lanePath = _.initial(d.lanePath.split(FQ_DELIMITER)).join([separator="/"]);;

					 _lane= getLaneByNameNEW(_lanePath);
					console.log("lanePath: "+_lane.name);

					var _m =get_metrics(d3.select(this).node());
					var _y1 = y(_lane.yt1)+margin.top;
					var _y2 = y(_lane.yt2)+margin.top;

					console.log("m.Y: "+_m.y+" lane Y1:" +_y1+" Y2: "+_y2);
					var _y = _m.y-250;
					console.log("...ok meaning i am now from a board perspective on y: "+_y);
					console.log("d._id: "+d._id);

					console.log("NG: on board: "+BOARD.name+" "+BOARD._id);
					console.log("BOARD.items: "+BOARD.items.length);

					var _item;
					_item = getItemByKey(BOARD.items,"itemRef",d.Number).itemView;
					console.log("NG: itemView: "+JSON.stringify(_item));

					// and it would be interesting to derive the lane we are in after dragend
					// currently have to iterate over lanes and according sublanes
					// have to use the y() function on the .yt1 and .yt2 cordinates (d3 domain functions)

					var _sublaneOld;
					_sublaneOld =_item.lanePath;

					var _sublaneNew;

					var _sublane;
					var _lane;//= getLaneByY(_y);

					var _themes = getThemesNEW();
					var _lanes = getLanesNEW();
					var _sublanes = getSublanesNEW();
					for (var l in _lanes){
						if (_y >= y(_lanes[l].yt1) && _y <= y(_lanes[l].yt2)) {
							_lane =_lanes[l];
							console.log("************** MATCH LANE*****************"+_lane.name);

							for (var sl in _sublanes){
								console.log("_y: "+_y+" sublane.yt1: "+_sublanes[sl].yt1+ " sublane.yt2: "+_sublanes[sl].yt2);
								if (_y >= y(_sublanes[sl].yt1) && _y <= y(_sublanes[sl].yt2)) {
									_sublane = _sublanes[sl];
									console.log("************** MATCH SUBLANE*****************"+_sublane.name+" old sublane: "+_sublaneOld);

									_item.lanePath = _sublane.name;
									console.log("SUBLANE = "+_item.lanePath);
									_sublaneNew = _item.lanePath;
								}
							}
						}
					}

					if (_m.y-250 < 0 || _m.y-250>y(100)){
						//put back to initial dragstart coords
						 d3.select(this).attr("transform","translate(0,0)");
						 d.x=0;
						 d.y=0;
						console.log("***** nope");
					}

					d3.select(this).style("opacity",1);

					// and here we could persist the y coordinate as sublaneOffset

					console.log("before: sublaneOffset = "+_item.sublaneOffset);

					console.log("oldsublane: "+_sublaneOld);
					console.log("newsublane: "+_sublaneNew);

					// only if we stay in the same sublane we can change the offset !!!
					// offset is ONLY valid within same sublane
					if (_sublaneOld == _sublaneNew){
						_item.sublaneOffset =(parseInt(_item.sublaneOffset) ||0)  +parseInt(d.y);
					}
					else {
						_item.sublaneOffset = 0;

					}
					console.log("after: sublaneOffset = "+_item.sublaneOffset);

					if (movedY!=0) ajaxCall("POST","save",new Array(BOARD),"boards");
					// and refresh the transient initiativeData
					joinBoard2Initiatives(BOARD,initiativeData);

					console.log("[OK] lets persist the change in y drag movement ....[id] = "+JSON.stringify(_item));

					// and highlight the sublane we are in
					var _item = getItemByKey(initiativeData,"Number",d.Number);

					var _sublane = getSublaneByNameNEW(_item.lanePath);


					console.log(">>>> highlight sublane: "+_sublane.name);

					highlightLane(d3.select("#lanes"),_sublane);


				}
			});
		return drag_item;
		//test end

}
