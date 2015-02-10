/** NG version (2.0) based on node.js express and new data structures 
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.github.com/gkathan/kanban
 */



/**
 * high level metaphors (tree and stuff...)
 */
function drawOverviewMetaphors(svg){
	
	var gMetaphors = svg.append("g").attr("id","metaphors").style("visibility","hidden");
	
	// demarcation line between themes
	var _y2 = 0;//y(getSublaneByNameNEW("shared").yt1);
	_drawLine(gMetaphors,0,_y2,x(KANBAN_END)-80,_y2,"metaphorDemarcationLine");
	
	
	
	var _y = _drawThemeDemarcation(gMetaphors,"metaphorDemarcationLineThin");
	
	
	// and a shaded "enabling rect"
	_drawRect(gMetaphors,x(KANBAN_START)-margin.left,_y2,x(KANBAN_END)+margin.right+margin.left,(height-_y2),"metaphorEnablingBlock");
	
	
	// same as the grid.drawVision trangle
	var _x = x(KANBAN_START.getTime()+(KANBAN_END.getTime()-KANBAN_START.getTime())/2)-130;
	//tree.height is 1000px 
	_drawXlink(gMetaphors,"#tree",_x,0,{"scale":(height/800),"opacity":0.7});
	
	_drawXlink(gMetaphors,"#timeline",0,-85,{"scale":(1,(x(KANBAN_END)-x(KANBAN_START))/1000),"opacity":0.3});
	_drawText(gMetaphors,"timeline",x(KANBAN_END)-55,-45,{"size":"20px","color":"#aaaaaa","weight":"bold","anchor":"end"});
	
	_drawBracket(gMetaphors,"grey","right",x(KANBAN_END)-60,0,1.5,(_y/100),"bracket",0.2);
	_drawBracket(gMetaphors,"grey","right",x(KANBAN_END)-60,_y,1.5,(height-_y)/100,"bracket",0.2);
	
	_drawText(gMetaphors,"REVENUE STREAMS",x(KANBAN_END)-10,_y/2,{"size":(height-_y)/12,"opacity":0.7,"color":"#999999","weight":"bold","mode":"tb","anchor":"middle"});
	_drawText(gMetaphors,"ENABLING STREAMS",x(KANBAN_END)-10,_y+20,{"size":_y/18,"opacity":0.7,"color":"#999999","weight":"bold","mode":"tb"});
	
	_drawRect(gMetaphors,x(KANBAN_START)-margin.left,height,x(KANBAN_END)+margin.right+margin.left,(height+200),"metaphorCultureBlock");
	
	_drawLine(gMetaphors,-300,height,x(KANBAN_END)+500,height,"metaphorDemarcationLineThin");
	
	_drawText(gMetaphors,"PEOPLE & CULTURE",20,height+60,{"size":_y/15,"opacity":0.7,"color":"#ffffff","weight":"bold"});
	_drawText(gMetaphors,"LEADERSHIP",x(KANBAN_END)-20,height+60,{"size":_y/15,"opacity":0.7,"color":"#ffffff","weight":"bold","anchor":"end"});
	
}



/**
 * prototype for showing inline graphcharts
 */
function drawLineChart()
{
	var linechart = svg.select("#metrics").append("g").attr("id","linechart").style("visibility","hidden");
	var parseDate = d3.time.format("%d-%b-%y").parse;
	var _lane = getLaneByNameNEW("bwin");

	if (_lane){
	var _y1 = y(getLaneByNameNEW("bwin").yt1);
		var _y2 = y(getLaneByNameNEW("bwin").yt2);
		var _height = _y2-_y1;
		var x_line = d3.time.scale().range([0, x(WIP_START)]);
		var y_line = d3.scale.linear().range([_height,_y1]);

		var xLineAxis = d3.svg.axis()
			.scale(x_line)
			.tickFormat("")
			.tickSize(0)
			.orient("top");

		var yLineAxis = d3.svg.axis()
			.scale(y_line)
			.orient("left");

		var line = d3.svg.line()
			.x(function(d) { return x_line(d.date); })
			.y(function(d) { return y_line(d.NGR_bwin); });

		var area = d3.svg.area()
			.x(function(d) { return x_line(d.date); })
			.y0(_height)
			.y1(function(d) { return y_line(d.NGR_bwin); });

		var NGR_sum=360.0;

		d3.tsv("/data/linechart.tsv", function(error, data) {
		  data.forEach(function(d) {
			d.date = parseDate(d.date);
			NGR_sum -=parseFloat(d.NGR_bwin);
			d.NGR_bwin =NGR_sum;
		  });


		  x_line.domain(d3.extent(data, function(d) { return d.date; }));
		  y_line.domain([0,400]);

		linechart.append("path")
				.datum(data)
				.attr("class", "area")
				.attr("d", area);
		  
		  linechart.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + _height + ")")
			  .call(xLineAxis);

		  linechart.append("g")
			  .attr("class", "y axis")
			  .style("font-size","6px")
			
			  .call(yLineAxis)
			.append("text")
			  .attr("transform", "translate (0,"+(_y2-5)+") rotate(0)")
			  .style("text-anchor", "start")
			  .style("fill", "white")
			  .style("opacity", 0.8)
			  .style("font-size", "12px")
			  .style("font-weight", "bold")
			  .text("NGR (mio EUR)");

		  linechart.append("path")
			  .datum(data)
			  .attr("class", "line")
			  .attr("d", line);
		});

		console.log("NGR sum:"+NGR_sum);
	}

}
