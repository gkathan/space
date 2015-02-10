function hideWhiteboard(){
	d3.selectAll("#whiteboard").style("visibility","hidden")
}

function showWhiteboard(){
	d3.selectAll("#whiteboard").style("visibility","visible")
}


function renderWhiteboard() {
	
	whiteboard = d3.select("svg")
		.attr("width", WHITEBOARD_WIDTH)//width + margin.left + margin.right+300)
		.attr("height", WHITEBOARD_HEIGHT)//height + margin.top + margin.bottom)
		.append("g")
		.attr("id","whiteboard")
		.attr("transform", "translate( 20,20)");
		
		
 	$.when(//$.getJSON("/data/data.php?type=initiatives"))
	  		  $.getJSON(dataSourceFor("initiatives")))
			
			.done(function(initiatives){
					initiativeData=initiatives.filter(function(d){return d.state=="todo";});
					d3.select("#kanban").style("visibility","hidden");

					d3.select("#whiteboard").style("visibility","visible");
					
					_drawXlink(whiteboard,"#whiteboard",20,20,{"scale":3});

					//drawWhiteboardPostits();
					for (var i in initiativeData){
						// function Postit(id,text,x,y,scale,size,color,textcolor){
						var d = initiativeData[i];
						var p = new Postit(d.id,d.name+" "+d.name2,150+(i*15),150+(i*15),4,3,"yellow","black");
						p.setTitle("::"+d.lane);
						p.draw(whiteboard)
						
					}
					
//					drawAll();
//					drawCustomPostits();
					//initHandlers();
					
				});
}


