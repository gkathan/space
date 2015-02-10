// global variables
var CONTEXT="CONTEXT";



var orgData;
var orgTree;


var dd;


// raster px configuration

var WIDTH =1600;
var HEIGHT = 1500;


var margin;
var width,height;

var outerDiameter,innerDiameter;


var x,y,svg,whiteboard,drag,drag_x;


var COLOR_BPTY="#174D75";

var COLOR_TARGET = COLOR_BPTY;


var color;
var pack;
var nodes;

var depth;





//flippant test
var back;

var tooltip;

function setMargin(){
	
	margin = {top: 100, right: 100, bottom: 100, left: 150};
}


function init(){
	 
	 setMargin();
	 
	 margin = 10,
		outerDiameter = 1500,
		innerDiameter = outerDiameter - margin - margin;

	 x = d3.scale.linear()
		.range([0, innerDiameter]);

	 y = d3.scale.linear()
		.range([0, innerDiameter]);
		
		color = d3.scale.linear()
		.domain([-1, 5])
		.range(["hsl(205.42,80.49%,46.03%)", "hsl(191.49,100%,89.45%)"])
		.interpolate(d3.interpolateHcl);

	 pack = d3.layout.pack()
		.padding(2)
		.size([innerDiameter, innerDiameter])
		.value(function(d) { 
			var count = getInt(d["Backlog Item Count"]);
			if (count ==0) return 10;
			else return count;
			  
			
			//return 25;
			 })


	 svg = d3.select("body").append("svg")
    .attr("width", outerDiameter*2)
    .attr("height", outerDiameter)
	.attr("id","org")
	.attr("version","1.1")
	.attr("xmlns","http://www.w3.org/2000/svg")
	.style("background","white")
    .attr("xml:space","preserve");  

	svg = d3.select("svg")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)

  
  svg.append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

}


function render(collection){
	
		//d3.json(dataSourceFor("productportfolio"),function(data){
		d3.json(dataSourceFor(collection),function(data){
	
	orgData = data;
	

/*
	// and fill in missing values due to v1 export
	var _length = data.length;
	for (var i=0; i<_length; i++){
		//console.log(orgData[i]);
		for (var l=0;l<=5;l++){
			if (data[i-1]){
				console.log("** we have a precedessor");
				if (!data[i]["l"+l] && (data[i-1]["l"+(l-1)]==data[i]["l"+(l-1)])) data[i]["l"+l] = data[i-1]["l"+l]; 
			}
		}
	}
*/

	//root = _.nest(orgData,["l0","l1","l2","l3","l4","l5","l6"]);
	
	
	//root = _.nest(orgData,["Vertical","Function","Location","Supervisor Full Name"]);
	
	
	//root = _.nest(orgData,["Location","Cost Centre","Function","Supervisor Full Name"]);
	
	
	if (collection=="productportfolio"){
		// productportfolio
		//root = _.nest(orgData,["Owner / Contact","Channels","Suite / Brand","Market","Label (Wallet)","ProductArea","Product"]);
		root = _.nest(orgData,["Market","Suite / Brand","Label (Wallet)","ProductArea","Product"]);
	}
	else if (collection=="productcatalog"){
	// productcatalog
		root = _.nest(orgData,["Offering","Product/Service Family","Product/Service"]);
	}
	else if (collection=="targets"){
	// productcatalog
		root = _.nest(orgData,["cluster","group","target","outcome"]);
	}
	else if (collection=="organization"){
	// productcatalog
		root = _.nest(orgData,["Location","Cost Centre","Function","Supervisor Full Name"]);
	}
	
	
	else if (collection=="incidents"){
	// productcatalog
		root = _.nest(orgData,["Incident state", "Category","Priority","IT-Service" ]);
	}
	
	
	//root = _.nest(orgData,["Employing Legal Entity","Location","Function","Supervisor Full Name"]);
	
	//root = _.nest(orgData,["Function","Scrum Team 1"]);
	
	depth = 4 //number of nest levels 
	
				 
    //var root = findNorbert(makeTree(createList(data)));
	count (root,0);

	treeData = root;

 init();
 
 
   focus = root,
      nodes = pack.nodes(root);

  svg.append("g").selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", function(d) { return zoom(focus == d ? root : d); });

  svg.append("g").selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("font-size","25px")
      .style("font-weight","bold")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? null : "none"; })
      //.text(function(d) { if (d.children) return d.position+" ("+d.overallReports+")"; else return d.employee; });
	  .text(function(d) { if (d.children && d.depth<=depth) {return d.name +" ("+d.overallReports+")";} else return d["Full Name"]});

  
  d3.select(window)
      .on("click", function() { zoom(root); });

  function zoom(d, i) {
    var focus0 = focus;
    focus = d;

    var k = innerDiameter / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);
    d3.event.stopPropagation();

    var transition = d3.selectAll("text,circle").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    transition.filter("circle")
        .attr("r", function(d) { return k * d.r; });

    transition.filter("text")
      .filter(function(d) { return d.parent === focus || d.parent === focus0; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }
});

d3.select(self.frameElement).style("height", outerDiameter + "px");
				
					console.log("cactus.D3.render says: huh ?");
					//renderOrg();
			//	});
//}); // end xml load anonymous 

}

