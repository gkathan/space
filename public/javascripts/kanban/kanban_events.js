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
 * soccer world championship 2014 block => layer "events"
 */
function drawWC2014(){
	
	if (KANBAN_END > new Date("2014-07-13") && KANBAN_START < new Date("2014-05-13")){
	
		var gEvents = svg.append("g").attr("id","events");
		var _x1 = x(new Date("2014-06-13"));
		var _x2 = x(new Date("2014-07-13"));
		
		gEvents.append("rect")
		.attr("x",_x1)
		.attr("width",(_x2-_x1))
		.attr("y",0)
		.attr("height",y(100))
		.style("fill","white")
		.style("opacity",0.4);
		
		_drawXlink(gEvents,"#wc2014",(_x1+15),-65,{"scale":.3});

	}
}




/**
 * release calendar
 */
function drawReleases(){	
	
	d3.select("#releases").remove()
	console.log("####removed #releases");


	svg.append("g")
		.attr("id","releases")
		.style("visibility","hidden")
				
		.selectAll("release")
		//filtered data before used in D3
		.data(releaseData.filter(function(d){return (new Date(d.CurrentReleaseDate))>KANBAN_START}))
		.enter()
		.append("g")
		.attr("id",function(d){return d.id})
		
		//append elelements on same level within metrics as a group
		// http://stackoverflow.com/questions/13203897/d3-nested-appends-and-data-flow
		.each(function(d){
			
			var _releaseDate = new Date(d.CurrentReleaseDate);
			
			console.log("*** release: "+d.ReleaseName+" date: "+d.CurrentReleaseDate);
			if (_releaseDate > KANBAN_START){
				_drawLine(d3.select(this),x(_releaseDate),-5,x(_releaseDate),height+5,"releaseLine",[{"start":"rect_blue"}]);
		
			_drawText(d3.select(this),d.ReleaseName,x(_releaseDate),-15,{"size":"7px","weight":"bold","opacity":0.5,"color":"blue","rotate":-45})
		
		}
	});
			
}
