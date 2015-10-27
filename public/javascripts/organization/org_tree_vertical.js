var treeData;
var i = 0;
var svg;
var margin;
var tree;
var diagonal;

var _currentRoot;
var _currentRootParent;

var url="/api/space/rest/";
if (date){
   url+="organizationtree/history/"+date;
  ORG_DATE=date;
}
else{
   url+="organizationtree";
}

var _root;

initialLoad();



function initialLoad(){
	d3.json(url, function(root) {
		//initially we load the full org tree and store it on client as treeData
		if (!treeData) treeData=root;
		refresh(baseRoot["Employee Number"]);
	})
}

function refresh(name){
	var _url = url;
	d3.select("svg").transition().duration(500).style("opacity",0);
	d3.select("svg").remove();
	//remove();
	console.log(">>>> url: "+_url);
	if (name){
	  if (checkId(name)) _url+="?employeeId="+name;
		else _url+="?employee="+name;
	}
	d3.json(_url, function(root) {
	console.log("resfresh with url: "+_url);
	  console.log("after json: "+root.stats);
		if (!treeData) treeData=root;
		_currentRoot = root.tree.employee;
		if (root.tree.employee) _currentRootParent = root.tree.parent;

	  //$('#stats').text(JSON.stringify(root.stats));
		init(root.stats);
		update(root.tree,root.stats);
	})
}

function init(stats){
	// ************** Generate the tree diagram	 *****************
	var _width=500;
	var _height=500;
	// max depth of hierarchy
	var _total = stats.total;
	var _levels = stats.levels.length;
	var _avg = stats.total/_levels;
	console.log("total: "+stats.total+" _avg: "+_avg);
	_height+=_avg*5;
	_width+=_avg*30;
	$('#orgpanel').css("width",_width+200+"px");
	console.log("_height: "+_height+" _widht: "+_width);
	margin = {top: 40, right: 50, bottom: 20, left: 50},
		width = _width - margin.right - margin.left,
		height = _height - margin.top - margin.bottom;
	// https://github.com/mbostock/d3/wiki/Tree-Layout
	//http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html
	tree = d3.layout.tree()
		.size([_width, _height])
		.sort(function(a,b){return a.position<b.position})
	diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.x, d.y]; });
}


function update(root,stats) {
	var _height = 100 + margin.top + margin.bottom+(stats.levels.length*70);
	console.log("_height: "+_height);
	console.log("levels: "+(stats.levels.length*20));

	svg = d3.select("#d3container").append("svg").style("opacity",0)
	.attr("width", width + margin.right + margin.left+2000)
	.attr("height", _height)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Define the div for the tooltip
	var div = d3.select("body").append("div")
    .attr("class", "tooltip")
		.attr("id", "tooltip")
    .style("opacity", 0);


	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });
  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });
  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) {
		  return "translate(" + d.x + "," + d.y + ")"; });


  nodeEnter.append("svg:image")
  .attr("xlink:href",function(d){return "/images/employees/circle/"+d.name+".png";})
  .attr("width",function(d){if (d.children||d.level!=stats.levels.length) return "22px"; else return "12px";})
  .attr("height",function(d){if (d.children||d.level!=stats.levels.length) return "22px"; else return "12px";})
	.attr("transform", function(d) {
  		  if (d.children ||d.level!=stats.levels.length) return "translate(-12,-12)"; else return "translate(-6,-2)";  })

;

  nodeEnter.append("circle")
	  .attr("r",function(d){if (d.children||d.level!=stats.levels.length) return "11px"; else return "6px";})
	  .style("fill", "red")
		.style("opacity", 0)
		.on("mouseover", function(d){_mouseOver(d);})
		.on("mouseout", function(d){_mouseOut(d);})
		.on("click",function(d){refresh(d.employee)})


  nodeEnter.append("text")
	  .attr("y", function(d) {
		  return d.children || stats.total==1  ? -18 : 8; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d){if (d.children || (!d.children && stats.total==1)) return "middle"; else return "top";})
		.attr("writing-mode", function(d){if (!d.children && stats.total>1) return "tb";})

		.style("font-weight", function(d){if (d.children || (!d.children && stats.total==1)) return "bold";})
		.text(function(d) { return d.employee })
	  .style("fill-opacity", 1)
		.on("mouseover", function(d){_mouseOver(d);})
		.on("mouseout", function(d){_mouseOut(d);})
		.on("click",function(d){refresh(d.employee)})



  nodeEnter.append("text")
	  .attr("y", function(d) {
		  return d.children || d._children ? -24 : 24; })
	  .attr("dy", ".35em")
	  //.attr("text-anchor", "bottom")
		//.attr("writing-mode", "tb")
		.attr("text-anchor", "middle")
		.style("font-weight", function(d){if (d.children) return "normal";})
		.style("font-size","6px")
		.text(function(d) { if (d.children) return d.position; })
	  .style("fill-opacity", 1)
		.on("mouseover", function(d){_mouseOver(d);})
		.on("mouseout", function(d){_mouseOut(d);})
		.on("click",function(d){refresh(d.employee)})
;

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);

	_root =root;


  svg.append("polygon")
	  .attr("class","node")
		.attr("points", "-15,20 0,10 15,20")
		.attr("transform","translate("+root.x+",-50)")

		.style("fill", "lightgrey")
		.style("opacity", 1)
		.on("click",function(d){refresh(_currentRootParent)})

	d3.select("svg").transition().duration(500).style("opacity",1)
}





function _mouseOver(d){
	console.log("***over")
	d3.select("#tooltip")
	.html(template({employee:d,sizeImage:60,sizeName:14}))
	.style("font-size","8px")
	.style("left", (d3.event.pageX+25) + "px")
	.style("top", (d3.event.pageY - 60) + "px")
	//.transition()
	//.duration(100)
	.style("opacity",1)
}

function _mouseOut(d){
	console.log("***out")
	d3.select("#tooltip")
	//.transition()
	//.duration(200)
	.style("opacity",0)
}
;
