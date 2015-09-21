/** NG version (2.0) based on node.js express and new data structures
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright:
 * @license:
 * @website: www.github.com/gkathan/kanban
 */
function showVision(){
	d3.select("#vision").style("visibility","visible");
}

function hideVision(){
	d3.select("#vision").style("visibility","hidden");
}

function drawVision(){
	"use strict";
	d3.select("#vision").remove();

	var gVision= svg.append("g")
		.attr("id","vision")
		.attr("class","draggable");

	if (BOARD.viewConfig.vision=="hide"){
		gVision.style("visibility","hidden");
	}
	// ----- vision statement ------
	var _x = x(KANBAN_START.getTime()+(KANBAN_END.getTime()-KANBAN_START.getTime())/2);
	var _y = -200;
	_drawXlink(gVision,"#world",(_x-175),(_y+27),{"scale":1});

	_drawText(gVision,BOARD.vision,(_x-160),(_y-15),{"size":"32px","color":COLOR_BPTY,"weight":"bold"});
	_drawText(gVision,BOARD.subvision,(_x-160),(_y+10),{"size":"14px","color":COLOR_BPTY,"weight":"bold"});

	//_drawXlink(gVision,"#vision_statement",(_x-160),(_y-30),{"scale":2});

	// --- mission strategy stuff ------
	_drawBracket(gVision,"blue","bottom",_x-160,_y+90,3.3,0.8,"triangle",1);

	_x = x(KANBAN_START.getTime()+(KANBAN_END.getTime()-KANBAN_START.getTime())/2)-100;
	//var _x = 460;

	var _mission = gVision.append("text")
		.attr("x",_x)
		.attr("y",_y+40)
		.style("fill",COLOR_BPTY)
		.style("text-anchor","start")
		.style("font-style","normal")
		.style("font-weight","bold")
		.style("font-size","10px");

	textarea(_mission,BOARD.mission,_x,_y+40,100,8);
}
