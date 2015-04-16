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
var pack;
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

	 pack = d3.layout.pack()
		.padding(5)
		.size([innerDiameter, innerDiameter])
		.value(function(d) {
			/*
			var count = getInt(d["Backlog Item Count"]);
			if (count ==0) return 10;
			else return count;
			 */

			return 25;
			 })


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


  var _leafTextFields="";

  console.log("***** collection: "+collection);

  if (collection=="targets") _leafTextFields=["target","outcome","description","measure","by when"];
  if (collection=="productcatalog") _leafTextFields=["Name","Version","Comments","Owner","Description","DependsOn","ConsumedBy"];



	var _g = svg.append("g").selectAll("text")
		.data(nodes)
		.enter();
		var _text = _g.append("text")
		.attr("class", "label")
		.style("font-size",function(d) { if (d.children && d.depth==1) return "25px"; else if (d.children && d.depth>(depth-d.depth)-1) return "14px";  else return "12px"})
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
		.style("display", function(d) { return d.parent === root ? null : "none"; })
		.text(function(d) { if (d.children && d.depth<=depth) {return d.name ;} else {
			var _leafText="";
			for (var i in _leafTextFields){
				_leafText+=_leafTextFields[i]+": "+d[_leafTextFields[i]];
			}
			return _leafText;
			}});

	   /*
		textarea(_text,function(d) { if (d.children && d.depth<=depth) {return d.name +" ("+d.overallReports+")";} else {
			var _leafText="";
			for (var i in _leafTextFields){
				_leafText+=_leafTextFields[i]+": "+d[_leafTextFields[i]];
			}
			return _leafText;
			}},_itemXPlanned,_itemY,ITEM_TEXT_SWAG_MAX_CHARS,(5+d.Swag/500));
*/


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
	//console.log("cactus.D3.render says: huh ?");

}
