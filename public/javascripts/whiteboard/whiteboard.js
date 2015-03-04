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
		
		
 	//$.when($.getJSON(dataSourceFor("initiatives")))
		//.done(function(initiatives){
			//initiativeData=initiatives.filter(function(d){return d.state=="todo";});
			
			d3.select("#kanban").style("visibility","hidden");

			d3.select("#whiteboard").style("visibility","visible");
			
			_drawXlink(whiteboard,"#whiteboard",20,20,{"scale":3});

			for (var i in boardData.postits){
				// function Postit(id,text,x,y,scale,size,color,textcolor){
				var _postit = boardData.postits[i];
				
				console.log("* postit: "+JSON.stringify(_postit));
				var p = new Postit(_postit.id,_postit.text,150+(i*15),150+(i*15),4,3,_postit.color,"black");
				p.setTitle("::"+_postit.title);
				p.draw(whiteboard)
			}
		//});
}


