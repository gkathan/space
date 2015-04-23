// global variables
var CONTEXT="CONTEXT";

var DATA;

var orgData;
var orgTree;

// raster px configuration
var WIDTH =1100;
var HEIGHT = 1000;

var margin;
var width,height;

var outerDiameter,innerDiameter;

var x,y,svg,whiteboard,drag,drag_x;

var COLOR_BPTY="#174D75";
/*
#00b8e4 türkis
#f99d1c orange
#82cec1 lind
#ffcd03 yellow
#b0acd5 pink
*/
var COLOR_TARGET = COLOR_BPTY;

var color;
var partition;
var nodes;

var depth;

//flippant test
var back;

var tooltip;

function setMargin(){
	margin = {top: 20, right: 20, bottom: 20, left: 40};
}

function init(){
	 setMargin();

	 margin = 10,
		outerDiameter = 1000,
		innerDiameter = outerDiameter+100 ;

	 x = d3.scale.linear()
		.range([0, innerDiameter]);

	 y = d3.scale.linear()
		.range([0, innerDiameter]);

		color = d3.scale.linear()
		.domain([0, depth])

		 // https://github.com/mbostock/d3/wiki/Ordinal-Scales
		 // http://colorbrewer2.org/
		 //.range(colorbrewer.bpty_primary[5])
		.range(["hsl(206,67%,27%)", "hsl(206,67%,90%)"])
		.interpolate(d3.interpolateHcl);

	 partition = d3.layout.partition()
	    .value(function(d) { return d.size; });
	    //.value(function(d) { if (d.children) return d.children.length; else return 1;});


	 svg = d3.select("#d3container").append("svg")
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


function render(collection,date){
	console.log("****** render collection= "+collection);
	org_date = date;
	if (date){
		 DATA=collection+"/history/";
	}
	else{
		DATA=collection;
		date="";
	}
	console.log("** render(): date = "+date);
	console.log("** datasource: "+dataSourceFor(DATA+date));

	d3.json(dataSourceFor(DATA+date),function(data){
			if (DATA=="organization/history/"){
				orgData = data.oItems;
			}
			else {
				orgData = data;
			}

		console.log("data.length: "+orgData.length);

		//orgData = data;

		var nestLevels=[];

		if (collection=="productportfolio"){
			nestLevels = ["Market","Suite / Brand","Label (Wallet)","ProductArea","Product"];
			root = _.nest(orgData,nestLevels);
		}
		else if (collection=="productcatalog"){
			nestLevels = ["Type","Offering","Family","Name"];
			root = _.nest(orgData,nestLevels);
		}
		else if (collection=="targets"){
			nestLevels = ["cluster","group","target"];
			root = _.nest(orgData,nestLevels);
		}
		else if (collection=="organization"){
			nestLevels = ["Location","Cost Centre","Function","Supervisor Full Name"];
			console.log("...nesting organization by "+nestLevels);
			root = _.nest(orgData,nestLevels);
			console.log("...root "+JSON.stringify(root));
		}
		else if (collection=="incidents"){
			nestLevels = ["Incident state", "Category","Priority","IT-Service" ];
			root = _.nest(orgData,nestLevels);
		}


		depth = nestLevels.length //number of nest levels

		count (root,0);

		treeData = root;

		init();



		var g = svg.selectAll("g")
      .data(partition.nodes(root))
    .enter().append("svg:g")
      .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
      .on("click", click);

  var kx = w / root.dx,
      ky = h / 1;

  g.append("svg:rect")
      .attr("width", root.dy * kx)
      .attr("height", function(d) { return d.dx * ky; })
        .attr("class", function(d) { return d.children ? "parent" : "child"; });

  g.append("svg:text")
      .attr("transform", transform)
      .attr("dy", ".35em")
      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
      .text(function(d) { return d.name; })

  d3.select(window)
      .on("click", function() { click(root); })

  function click(d) {
    if (!d.children) return;

    kx = (d.y ? w - 40 : w) / (1 - d.y);
    ky = h / d.dx;
    x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
    y.domain([d.x, d.x + d.dx]);

    var t = g.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

    t.select("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

    t.select("text")
        .attr("transform", transform)
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

    d3.event.stopPropagation();
  }

  function transform(d) {
    return "translate(8," + d.dx * ky / 2 + ")";
  }
});
}
