// ************** Generate the tree diagram	 *****************
var margin = {top: 40, right: 120, bottom: 20, left: 120},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;

var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("#d3container").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var treeData;

var _url="/api/space/rest/";
if (date){
   _url+="organizationtree/history/"+date;
  ORG_DATE=date;
}
else{
   _url+="organizationtree";
}
if (baseRoot){
  _url+="?employee="+baseRoot.employee;
  $('#orgRoot').text(baseRoot.employee);
  $('#orgRootDetails').text(baseRoot.job+" - "+baseRoot.location+" - "+baseRoot.costcenter);
  $('#orgRootImage').attr("src","/images/employees/circle/"+baseRoot.name+".png");
}


d3.json(_url, function(root) {
  treeData=root;
  update(root.tree);
})

function update(root) {
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

/*
  nodeEnter.append("circle")
	  .attr("r", 10)
	  .style("fill", "#fff");
*/
  nodeEnter.append("svg:image")
  .attr("xlink:href",function(d){return "/images/employees/circle/"+d.name+".png";})
  .attr("width","22px")
  .attr("height","22px")
  	  .attr("transform", function(d) {
  		  return "translate(-12,-12)"; });
;

  nodeEnter.append("text")
	  .attr("y", function(d) {
		  return d.children || d._children ? -18 : 18; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .text(function(d) { return d.employee; })
	  .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);
}
