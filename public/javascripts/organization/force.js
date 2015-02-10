
var data,root;

var width = 1600,
		height = 1000;

var color = d3.scale.category20();

var force = d3.layout.force()
    //.charge(10)
    //.linkDistance(80)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background","white");


	svg.append("use").attr("xlink:href","#whiteboard")
		.attr("transform","translate(100,0) scale(3) ");
			

var nodes,links;
//d3.json("json/force_data.json", function(error, graph) {
//d3.tsv("data/backlog.csv",function(error,data){
	
	//root = _.nest(data,["Lane","BusinessBacklog"]);

	d3.xml("/images/svg/external.svg", function(xml) {
		document.body.appendChild(document.importNode(xml.documentElement, true));


	d3.json(dataSourceFor("targets"),function(data){

	root = _.nest(data,["vision","cluster","group","target","outcome"]);


  //data = graph;
  
   nodes = flatten(root),
      links = d3.layout.tree().links(nodes);
  
  
  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var i=0;
  var node = svg.selectAll("node")
    .data(nodes)
    .enter()
    .append("g")
    
    .each(function(d){
    
      
   // items   	
    if (!d.children){
    
     	
     	var _r = d.size*1.2;
    	d3.select(this).append("circle")
      .attr("class", "node")
      .attr("r", _r)//d.Swag/200})
      .attr("transform","translate("+_r+","+_r+")")
      .style("fill", function(d) { return color(d.lane); })
      .style("opacity",0.4);
    
    
		d3.select(this).append("use").attr("xlink:href","#"+d.Type).attr("transform","scale("+d.size/12+")");
    
    	d3.select(this).append("text")
    	.text(function(d){return d.name})
    	.style("font-size","8px")
    	.style("font-weight","bold")
    	.style("font-family","arial")
    	.attr("dy",(2*_r)+5).style("text-anchor","middle");
    
	}
	else{
	/*d3.select(this).append("circle")
      .attr("class", "node")
      .attr("r", function(d){if (!d.children) return 20; return 10;})//d.Swag/200})
      .style("fill", function(d) { return color(d.lane); })
     */
     
     console.log("***** has children: "+d.name+" i: "+i+" x,y "+d.x+" , "+d.y);
   	 
   	 var _logo=d.name;
   	 if (d.name=="bwin") _logo = "bwin_black";
   	 console.log(".....logo: "+_logo);
   	 
   	 d3.select(this).append("use").attr("xlink:href","#"+_logo).attr("transform","scale(1.5)").style("opacity",1);//+_logo)
     
     var _size = 10;
     if (d.size) _size = d.size;
     
     d3.select(this).append("circle")
      .attr("class", "node")
      .attr("r", function(d){return _size/2;})
      //.attr("cx",d.x)
      //.attr("cy",d.y)//d.Swag/200})
      .style("fill", "grey");//function(d) { return color(d.lane); })

    	d3.select(this).append("text").text(function(d){return d.name})
    	.style("font-size","8px")
    	.style("font-family","arial")
    	.attr("dy",14).style("text-anchor","middle");
     
    }
      d3.select(this).call(force.drag);

  d3.select(this).append("title")
      .text(function(d) { return d.name; });
	i++;
 
 
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

	var _size;
	if (d.size) _size=d.size/10;
	else _size = 1; 
	
    node//.attr("x", function(d) { return d.x; })
        //.attr("y", function(d) { return d.y; })
        .attr("transform",function(d){return "translate ("+d.x+","+d.y+") scale("+_size+")"});
      
})
 
  });
});

})

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}
