/** NG version (2.0) based on node.js express and new data structures
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */

// queue metrics
var ITEMS_DONE,ITEMS_WIP,ITEMS_FUTURE,ITEMS_TOTAL,ITEMS_DELAYED,DAYS_DELAYED;
var ITEMS_PLANNED_TOBEDONE, ITEMS_INRANGE_DONE;
var SIZING_DONE,SIZING_WIP,SIZING_FUTURE,SIZING_TOTAL;


// ----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- QUEUES SECTION --------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

/**
*
*/
function drawQueues(board){
	d3.select("#queues").remove()

	calculateQueueMetrics(board.items);

	var _xWIPStart = x(WIP_START);
	// in case we look to much into the future with the timemachine..
	if (WIP_START>KANBAN_END){
		_xWIPStart = x(KANBAN_END);
	}

	var _xWIPWidth = x(WIP_END)-x(WIP_START);
	var _xFutureX = x(WIP_END);
	var _xFutureWidth = x(KANBAN_END) - _xFutureX;

	var _yMetricBaseTop = PILLAR_TOP; //top
	var _yMetricBase = height+52; //bottom

	var _yMetricDetailsOffset = 10;
	var _yMetricDetails2Offset = 8;

	var _yMetricBracketOffset = height+METRIC_BRACKET_Y_OFFSET;
	var gQueue = svg.append("g").attr("id","queues");

	if (board.viewConfig.queues=="hide"){
		gQueue.style("opacity",0);
	}


	//---------------- METRICS --------------------
	var gQueueMetrics = gQueue.append("g").attr("id","qmetrics");

	if (board.viewConfig.queuesmetrics=="hide"){
		gQueueMetrics.style("opacity",0);
	}


	//---------------- DONE queue --------------------
	var gQueueDone = gQueue.append("g").attr("id","done");

	//3px ofsfet for first box
	_drawQueueArea(gQueueDone,0,0,_xWIPStart,height,"done",3);

	// --------------- DONE METRICS ---------------------
	var _metric = {"text":"DONE" ,"items":ITEMS_DONE ,"swag": SIZING_DONE}
	_drawQueueMetric(gQueueMetrics,_metric,x(KANBAN_START),_yMetricBracketOffset,_xWIPStart,_xWIPStart/2,_yMetricBase,_yMetricDetailsOffset,null,"bottom");

	_metric = {"text":"FINISH RATE" ,"finishrate":Math.ceil(((ITEMS_INRANGE_DONE/ITEMS_PLANNED_TOBEDONE)*100)) ,"finished": ITEMS_INRANGE_DONE,"planned":ITEMS_PLANNED_TOBEDONE}
	_drawDoneMetric(gQueueMetrics,_metric,x(KANBAN_START),-40,_xWIPStart,_xWIPStart/2,-65,_yMetricDetailsOffset,null,"top");


	//_drawDoneMetrics(gQueueDone,x(KANBAN_START)+150,-40);


	// prevent render queuareas over KANBAN_END border
	if (WIP_START < KANBAN_END){
		//---------------- wip queue --------------------
		var gQueueWip = gQueue.append("g").attr("id","wip");

		// in case of going beyond ...
		if (WIP_END > KANBAN_END){
			_xWIPWidth = x(KANBAN_END)-x(WIP_START)
		}
		_drawQueueArea(gQueueWip,_xWIPStart,0,_xWIPWidth,height,"wip",0);

		// --------------- WIP METRICS ---------------------
		if (WIP_END<KANBAN_END){
			_metric = {"text":"WIP" ,"items":ITEMS_WIP ,"swag": SIZING_WIP}
			_drawQueueMetric(gQueueMetrics,_metric,_xWIPStart,_yMetricBracketOffset,_xWIPWidth,(_xWIPWidth/2+x(WIP_START)),_yMetricBase,_yMetricDetailsOffset,null,"bottom");
		}
		//-------------- TODAY markerlines ----------------
		_drawQueueMarker(d3.select("#axes"),WIP_START,"today",x(WIP_START),-TIMELINE_HEIGHT);

		_drawTodayMarker(d3.select("#axes"),x(WIP_START),_yMetricBaseTop,"TODAY");
		// ------------- WIP marker lines ---------------------
		if (WIP_END < KANBAN_END){
			_drawQueueMarker(gQueueWip,WIP_END,"wip",x(WIP_END),-TIMELINE_HEIGHT);
			//---------------- FUTURE queue --------------------
			var gQueueFuture = gQueue.append("g").attr("id","future");
			_drawQueueArea(gQueueFuture,_xFutureX,0,_xFutureWidth,height,"future",0);
		}
		//---------------- FUTURE METRICS --------------------
		if (WIP_END<KANBAN_END){
			_metric = {"text":"FUTURE" ,"items":ITEMS_FUTURE ,"swag": SIZING_FUTURE}
			_drawQueueMetric(gQueueMetrics,_metric,_xFutureX,_yMetricBracketOffset,_xFutureWidth,(_xFutureWidth/2+x(WIP_END)),_yMetricBase,_yMetricDetailsOffset,null,"bottom");
			//---------------- TOTAL METRICS --------------------
			_metric = {"text":"TOTAL" ,"items":ITEMS_TOTAL ,"swag": SIZING_TOTAL}
			_drawQueueMetric(gQueueMetrics,_metric,null,null,null,(_xFutureX+_xFutureWidth),_yMetricBase,_yMetricDetailsOffset,null,"bottom");
			//---------------- TOTAL DELAYED METRICS --------------------
			_metric = {"text":"DELAY" ,"items":ITEMS_DELAYED ,"swag": DAYS_DELAYED}
			if (ITEMS_DELAYED){
				_drawQueueMetric(gQueueMetrics,_metric,null,null,null,(_xFutureX+_xFutureWidth)+80,_yMetricBase,_yMetricDetailsOffset,"red","bottom");
			}
		}
	}
} //end drawQueues



/* ------------------------------------------------- drawQueues() helper functions ----------------------------------------------------------- */
		function _drawTodayMarker(svg,x,y,text){
				_drawXlink(svg,"#today_marker",(x-3),y+3,{"scale":"0.5"});
				_drawText(svg,text,x,y,{"size":"14px","weight":"bold","anchor":"middle","color":"red"});
		}

		/**
		 */
		function _drawQueueArea(svg,x,y,w,h,css,offsetX){
			var _offsetY=3;
			svg.append("rect")
			.attr("x", x+offsetX)
			.attr("y",y+_offsetY)
			.attr("width",w-offsetX)
			.attr("height",h-(2*_offsetY))
			.attr("class",css+"Queue");
		}

		/**
		 *
		 */
		function _drawQueueMarker(svg,date,css,x,y){
			_drawText(svg,moment(date).format("d-MMM-YYYY"),(x+5),(y+3),{"css":css+"Text","anchor":"start"});
			_drawText(svg,moment(date).format("d-MMM-YYYY"),(x+5),(height-y+3),{"weight":"bold","css":css+"Text","anchor":"start"});

			_drawLine(svg,(x+0.5),y,(x+0.5),(height-y),css+"Line",[{"start":"rect_red"},{"end":"rect_red"}]);
		}

		/**
		 */
		function _drawQueueMetric(svg,metric,bracketX,bracketY,width,metricX,metricY,space,color,orientation){
			if(!color) color=COLOR_BPTY;
			if (width){
				_drawXlink(svg,"#icon_bracket_"+orientation+"_blue",bracketX,bracketY,{"scale":(width/100)+",1","opacity":0.15});
			}
			_drawText(svg,metric.text,metricX,metricY,{"size":"14px","css":"metricItems","color":color,"anchor":"middle"});
			_drawText(svg,metric.items+ " items",metricX,(metricY+space),{"size":"9px","css":"metricItems","color":color,"anchor":"middle"});
			_drawText(svg,"["+metric.swag+" PD]",metricX,(metricY+space+(space-2)),{"size":"7px","css":"metricItems","color":color,"anchor":"middle"});
		}


		function _drawDoneMetric(svg,metric,bracketX,bracketY,width,metricX,metricY,space,color,orientation){
			if(!color) color=COLOR_BPTY;


			if (metric.finishrate<25) finishcolor="red";
			else if (metric.finishrate>25 && metric.finishrate<50) finishcolor="gold";
			else finishcolor="green";

			if (width){
				_drawXlink(svg,"#icon_bracket_"+orientation+"_blue",bracketX,bracketY,{"scale":(width/100)+",1","opacity":0.15});
			}
			_drawText(svg,metric.finishrate+"%",metricX,metricY,{"size":"14px","css":"metricItems","color":color,"anchor":"middle"});
			_drawText(svg,metric.text,metricX,(metricY+space),{"size":"9px","css":"metricItems","color":color,"anchor":"middle"});
			_drawText(svg,"FINISHED: "+metric.finished+" / PLANNED: "+metric.planned,metricX,(metricY+space+(space-2)),{"size":"7px","css":"metricItems","color":color,"anchor":"middle"});
		}


/* ------------------------------------------------- END drawQueues() helper functions ----------------------------------------------------------- */





/**  do some calculation - metrics about number and capacity of items
* writes currently in global vars ;-) => should be refactored into some array ...
**/
function calculateQueueMetrics(boardItems){
	var _d;

	SIZING_TOTAL=0;
	SIZING_DONE=0;
	SIZING_FUTURE=0;
	SIZING_WIP=0;
	ITEMS_DELAYED=0;
	ITEMS_DONE=0;
	ITEMS_FUTURE=0;
	ITEMS_TOTAL=0;
	ITEMS_WIP=0;
	DAYS_DELAYED=0;
	// items in shown DONE range which have been planned to be finished in this corridor and really have been finished
	ITEMS_INRANGE_DONE=0;
	ITEMS_PLANNED_TOBEDONE=0;

	var _item;

	_filteredItems = boardItems;

	for(_d in _filteredItems){
		_item = _filteredItems[_d];

		var _date = _item.actualDate;
		var _planDate = _item.planDate;

		var _sizingPD = parseInt(_item.Swag);
		var _delay = diffDays(_item.planDate,_item.actualDate);

		if (!isNaN(_sizingPD)) SIZING_TOTAL+=_sizingPD;
		if (new Date(_date)<WIP_START){
			if (new Date(_planDate)> KANBAN_START) ITEMS_PLANNED_TOBEDONE++;
			if (_item.state=="done" ){
				ITEMS_DONE++;
				if (!isNaN(_sizingPD)) SIZING_DONE+=_sizingPD;

				if (new Date(_date)<WIP_START && new Date(_planDate)>KANBAN_START){
					ITEMS_INRANGE_DONE++;
				}
			}

		}
		else if(new Date(_date)>KANBAN_START && new Date(_date)<WIP_END && new Date(_date)<KANBAN_END ) {
			ITEMS_WIP++;
 			if (!isNaN(_sizingPD)) SIZING_WIP+=_sizingPD;

		}
		else if (new Date(_date)>WIP_END && new Date(_date)<KANBAN_END){
			ITEMS_FUTURE++;

			if (!isNaN(_sizingPD)) SIZING_FUTURE+=_sizingPD;
		}
		//calculate delays
		if (_delay>0 && new Date(_item.planDate)>KANBAN_START){
			ITEMS_DELAYED++;
			DAYS_DELAYED = DAYS_DELAYED+_delay;
		}
	}
	ITEMS_TOTAL=ITEMS_DONE+ITEMS_WIP+ITEMS_FUTURE;
	SIZING_TOTAL = SIZING_DONE+SIZING_WIP+SIZING_FUTURE;
}
