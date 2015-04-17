// global variables
var CONTEXT="CONTEXT";



var orgData;
var orgTree;


var SIZE =8000;

var WIDTH =SIZE;
var HEIGHT = SIZE;
var MAX_DEPTH= 10;

//fixed distance between depth levels
var DEPTH_WIDTH = 320;

//input field to redefine root node (must match PI "Full Name")
var ROOT_NAME;// = "Mr. Thomas Priglinger";

var LEAF_NAMES = 1;
var LEAF_NODES = 0;



var margin;
var width,height;

var diameter;
var treeData;


var x,y,svg,tree,diagonal;

var COLOR_BPTY="#174D75";

var COLOR_TARGET = COLOR_BPTY;

var LEAF_NAMES = true;

var color;
var pack;
var nodes;








function init(){

	 diameter = SIZE;
	 treeData;

	 tree = d3.layout.tree()
		.size([360, diameter / 2 - 120])
		.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

	 diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

	 svg = d3.select("body").append("svg")
		.attr("width", diameter)
		.attr("height", diameter - 150)
		.style("background","white")
	  .append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


}


function render(svgFile,orgTable){

	d3.json(dataSourceFor("org"),function(data){
		orgData = data;
		init();


	 for (var i=0;i<MAX_DEPTH;i++){
		svg.append("circle")
		  .attr("r", DEPTH_WIDTH*(i+1))
		  .attr("x",SIZE/2)
		  .attr("y",SIZE/2)
		  .style("stroke","grey")
		  .style("fill",COLOR_BPTY)
		  .style("stroke-width",.5)
		  .style("fill-opacity",0.3-(i/25));

	 }

		 treeData = makeTree(createList(data));
	   var root = findNorbert(treeData);
		//var root = findJochen(findNorbert(makeTree(createList(data))).children);
		count (root,0);




	  var nodes = tree.nodes(root),
		  links = tree.links(nodes);

	  var link = svg.selectAll(".link")
		  .data(links)
		.enter().append("path")
		  .attr("class", "link")
		  .attr("d", diagonal);

	  var node = svg.selectAll(".node")
		  .data(nodes)
		.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

	  node.append("circle")
		  .attr("r", function(d){
		  return getSize(d,60)+"px";
		});
			//.style("fill",function(d){if (!d.children) return "#FFFFFF"});

	  // TOTAL
	  node.append("text")
		  .attr("dy","0px")
		  .attr("dx",function(d) { return d.x < 180 ? "-8px" : "8px"; })
		  .attr("text-anchor","middle")
		  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		.text(function(d) { return d.overallReports ? d.overallReports : ""; })
		.style("font-weight", "bold")
		.style("fill","red")
	    .style("font-size",function(d){
				return getSize(d,100)*3+"px";
			});

	 // POSITION
	  node.append("text")
		  .attr("dy", "0px")
		  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		  .text(function(d) { if (d.children) return d.position; else {if (!LEAF_NAMES) return ""; else return "";} })
		  .style("font-weight",function(d){return d.children ? "bold":"normal";})
		  .style("font-size",function(d){
				return (7+getSize(d))+"px";
			});
	// NAME
	node.append("text")
		  .attr("dy", function(d){return getSize(d,50,4)*1.6+"px"})
		  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		  .text(function(d) { if (d.children) return d.employee; else {if (!LEAF_NAMES) return ""; else return d.employee;} })
		   .style("font-size",function(d){
				return (6+getSize(d))+"px";
			});


	});

	d3.select(self.frameElement).style("height", diameter - 150 + "px");


		console.log("cactus.D3.render says: huh ?");


}
