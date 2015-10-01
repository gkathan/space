/** NG version (2.0) based on node.js express and new data structures
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */



var targetData;

var targetTree;


// width of the targets block after KANBAN_END and before LANELABELBOX_RIGHT
var TARGETS_COL_WIDTH=0;



var POSTIT_SCALE=1;
var CUSTUM_POSTIT_SCALE=1;

// PLAN or ACTUAL => defines whether text is below circle or icon
//var ITEM_TEXT_POSITION ="PLAN"

	var ITEM_TEXT_POSITION ="ACTUAL"



// ----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- TARGETS SECTION ---------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------


/** renders the targets
*/
function drawTargets(board){
	d3.selectAll("#targets,#targetDependencies").remove();

	var drag_item = _registerDragDrop();
	tooltip.attr("class","targetTooltip");

	//initiatives groups
	var gTargets = svg.append("g").attr("id","targets");

	svg.append("g").attr("id","targetDependencies");



	//target block
	_drawText(gTargets,"TARGET",x(KANBAN_END)+(TARGETS_COL_WIDTH/2),(-5),{"size":"14px","color":COLOR_BPTY,"opacity":0.3,"anchor":"middle","weight":"bold"});

	gTargets.append("rect")
		.attr("x",x(KANBAN_END))
		.attr("width",TARGETS_COL_WIDTH)
		.attr("y",0)
		.attr("height",y(100))
		.style("fill","white")
		.style("opacity",0.1);

	var groups = gTargets.selectAll("targets")
	.data(targetData)
	.enter()
	// **************** grouped item + svg block + label text
	.append("g")
	.attr("id",function(d){return "target_"+d.id})
	.each(function(d){
		var _size = d.size*ITEM_SCALE;

		// if we want to show exactly targets on their dates .....
		// var _itemXTarget = x(new Date(d.targetDate));

		//other option is to put them (visually cleaner) always after the timeline
		var _itemXTarget = x(KANBAN_END)+(TARGETS_COL_WIDTH/2);


		var _yOffset = getSublaneCenterOffset(getFQName(d));
		var _sublane = getSublaneByNameNEW(getFQName(d));

		if (_sublane) {
			var _sublaneHeigth = _sublane.yt2-_sublane.yt1;
			var _itemY = y(_sublane.yt1-_yOffset)+getInt(d.sublaneOffset);

			d3.select(this)
				.style("opacity",d.accuracy/10);


			// ------------  targeticon & names & postits --------------
			// if isCorporate flag is not set use "tactic" icon
			var _iconRef=d.Type+"_"+d.status;

			_drawXlink(d3.select(this),"#"+_iconRef,(_itemXTarget-(1.2*_size)),(_itemY-(1.2*_size)),{"scale":_size/10});

			//prio
			var _priofontsize = _size/1.25;
			_drawText(d3.select(this),d.ranking,_itemXTarget,(_itemY+(_size/3.5)),{"anchor":"middle","size":_priofontsize+"px","color":"white","weight":"normal"});

			_drawItemName(d3.select(this),d,_itemXTarget,(_itemY)+ parseInt(_size)+(6+(_size/5)*ITEM_FONTSCALE));

			//_drawPostit(d3.select(this),d);

			// transparent circle on top for the event listener
			d3.select(this)
				.append("circle")
					.attr("id","event_circle_"+d.id)
					.attr("cx",_itemXTarget)
					.attr("cy",_itemY)
					.attr("r",_size)
					.style("opacity",0)
					.on("mouseover", function(d){onTooltipOverHandler(d,tooltip);})

					.on("mousemove", function(d){onTooltipMoveHandler(tooltip);})

					.on("click",	function(d){console.log("CLICK");return;})

					.on("dblclick",	function(d){onTooltipDoubleClickHandler(tooltip,d3.select(this),d);})
					.on("mouseout", function(d){onTooltipOutHandler(d,tooltip);})

			// ------------  dependencies --------------
			// this should be extracted into function...

			//if (!isNaN(parseInt(d.initiatives))){
			if (d.initiatives){
				//console.log("============================== "+d.id+" depends on: "+d.dependsOn);

				var _dependingItems = d.initiatives.split(",");
				//console.log("target depending items: "+_dependingItems);

				// by default visibility is hidden
				var dep = d3.select("#targetDependencies")
						.append("g")
						.attr("id","depID_"+d.id)
						.style("visibility","hidden");

				for (var j=0;j<_dependingItems.length;j++) {
					var _d=_dependingItems[j];
					//lookup the concrete item
					var _dependingItem = getItemByID(initiativeData,_d);
					// do not draw line to items out of KANBAN range
					if (_dependingItem && new Date(_dependingItem.actualDate) >= KANBAN_START){
						var _depYOffset = getSublaneCenterOffset(getFQName(_dependingItem));
						//console.log("found depending item id: "+_dependingItem.id+ " "+_dependingItem.name);
						var _fromX = x(new Date(_dependingItem.actualDate))
						var _depsublane = getSublaneByNameNEW(getFQName(_dependingItem));
						if (_depsublane){
							var _fromY = y(_depsublane.yt1-_depYOffset)+getInt(_dependingItem.sublaneOffset);
							// put lines in one layer to turn on off globally
							_drawLine(dep,_fromX,_fromY,_itemXTarget-_size-2,_itemY,"targetDependLine",[{"end":"arrow_blue"}]);
						}
					}
				} // end for loop
				//console.log ("check depending element: "+d3.select("#item_block_"+d.dependsOn).getBBox());
			} // end if dependcies

			// drag test
			d3.select(this).data([ {"x":0, "y":0, "lane":d.lane} ]).call(drag_item);
		} // end if null check

	}) //end each()
} //end drawTargets


/** gets for an item all associated targets this items is contributing to
 */
function _getTargetsByItem(item){
	var _targets = new Array();
	for (var t in targetData){
		var _initiatives = targetData[t].initiatives;
		if (_initiatives){
			console.log("* initiatives of "+targetData[t].id+": "+_initiatives);
			var _items = _initiatives.split(",");
			for (var j in _items){
				console.log("  + checking "+_items[j]+ "=="+ item.id);
				if (_items[j]==item.id){
					_targets.push(targetData[t].id);
				}
			}
		}
	}
	return _targets;
}

/** gets for an item all associated metrics this items is contributing to
 */
function _getMetricsByItem(item){
	var _metrics = new Array();
	for (var m in metricData){
		var _targets = metricData[m].targets;
		if (_targets){
			console.log("* targets of "+metricData[m].id+": "+_targets);
			var _items = _targets.split(",");
			for (var j in _items){
				if (_items[j]==item.id){
					_metrics.push(metricData[m].id);
				}
			}
		}
	}
	return _metrics;
}
