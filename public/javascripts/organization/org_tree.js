// global variables
// http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html
var CONTEXT="CONTEXT";

var orgTree;
var baseRoot

var SIZE ;
var MARGIN_LEFT = 300;
var MARGIN_TOP = 100;

//default is "hr" ... HR line superivisor
// alternative is "bp" ...business process / functional superivisor
var HIERARCHY_TYPE ="hr";
var ROLE_TYPE="position";

var MAX_DEPTH= 10;

var MAX_LEVEL;
var MAX_COUNT;

// set by multiselect box to switch data
// default

//fixed distance between depth levels
var DEPTH_WIDTH = 200;

//input field to redefine root node (must match PI "Full Name")
var ROOT_NAME;// = "Mr. Thomas Priglinger";
var ORG_DATE;

var LEAF_NAMES = 1;
var LEAF_NODES = 1;
var WIDTH =SIZE;
var HEIGHT = SIZE;
var HEIGHT_OVERRIDE;

var duration=750;

var _tree;

var x,y,svg,tree,diagonal;

var COLOR_BPTY="#174D75";
var COLOR_TARGET = COLOR_BPTY;
var color;
var pack;
var nodes;

var _tree;


function _init(){
	d3.selectAll("svg").remove();
	// ************** Generate the tree diagram	 *****************
	var margin = {top: MARGIN_TOP, right: 120, bottom: 20, left: MARGIN_LEFT},
		width = WIDTH - margin.right - margin.left,
		height = HEIGHT - margin.top - margin.bottom;
	tree = d3.layout.tree()
		.size([height, width]);
	diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });
		//.projection(function(d) { return [d.x, d.y]; });
	svg = d3.select("#orgTreeChart").append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.style("background","white")
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

/** main entry
* called from .jade views
* TODO: refactor => this is quite ugly ununderstandable code ;-)
*/
function render(baseRoot,date,hierarchy){

	console.log("..............render(): baseRoot: "+baseRoot+ " hierarchy: "+hierarchy)
	this.baseRoot=baseRoot;
	var _url="/api/space/rest/";
	if (date){
		 _url+="organizationtree/history/"+date;
		ORG_DATE=date;
	}

	else{
		 _url+="organizationtree";
	}

	_url+="?true=true";

	if (baseRoot){
		if (baseRoot.employee)
			_url+="&employee="+baseRoot.employee;
		else
			_url+="&employee="+baseRoot;
	}

	if (hierarchy){
		_url+="&hierarchy="+hierarchy;
		$('#hierarchyType').text(hierarchy);
	}
	console.log("** render(): date = "+date+" - root: "+baseRoot+" -- url: "+_url);

	d3.json(_url,function(data){
		console.log("--- d3.json: _url: "+_url+" data: "+data.tree.employee);
		if (data){
			var root = data.tree;

			// show the tree node
			$('#orgRoot').text(root.employee);
			$('#orgRootDetails').text(root.job+" - "+root.location+" - "+root.costcenter);
			$('#orgRootImage').attr("src","/images/employees/circle/"+root.name+".png");

			// keep the full tree as global
			if (!orgTree) orgTree = root;
			MAX_COUNT=data.stats.total;//count(root,0);
			//enrich(root);
			console.log("------------------------------------------------------------------ MAX_COUNT ="+MAX_COUNT);
			statLevels = data.stats.levels;//calculateTreeStats(root);
			MAX_LEVEL=statLevels.length;
			SIZE=300+MAX_COUNT+(MAX_LEVEL*200);
			console.log("***** MAX_LEVEL: "+MAX_LEVEL);
			WIDTH=300+MAX_LEVEL*200;
			HEIGHT=200+MAX_COUNT*5;
			$('#orgpanel').css("width",WIDTH+200+"px");
			_init();
			_renderBackground(data.stats);
			_render(root);
		}
		else{
			console.log("[hmmmmm] no root object......");
		}
	});
}

var _links;


function _renderBackground(stats){
	//getting tree clustered by levels
	var levels = stats.levels
	MAX_LEVEL = levels.length;
	var _total = stats.total;
	console.log("* MAX DEPTH: "+levels.length+" DISTRIBUTION - TOTAL: "+_total);
	var gBack = d3.select("svg").append("g").attr("id","background");
	for (var i in levels){
		var _x = (i*DEPTH_WIDTH)+MARGIN_LEFT;
		_drawLine(gBack,_x,MARGIN_TOP-50,_x,SIZE,"dashedLine");
		_drawText(gBack,"N"+(MAX_LEVEL-i),_x,MARGIN_TOP-63,{"size":"10px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
		_drawText(gBack,"#"+levels[i].total,_x,MARGIN_TOP-53,{"size":"10px","color":"red","opacity":1,"anchor":"middle","weight":"bold"});
		_drawText(gBack,levels[i].percentage+"%"+"|f:"+levels[i].femalePercentage+"%"+"|i:"+levels[i].internalPercentage+"%"+"|l:"+(levels[i].leafPercentage?levels[i].leafPercentage+"%":'--')+"|t:"+levels[i].terminationPercentage+"%",_x,MARGIN_TOP-40,{"size":"9px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
		console.log(levels[i].length+" - ");
	}
	//sum
	_drawText(gBack,"SUM",MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-63,{"size":"10px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
	_drawText(gBack,"#"+stats.total,MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-53,{"size":"10px","color":"red","opacity":1,"anchor":"middle","weight":"bold"});
	_drawText(gBack,"100%"+"|f:"+stats.overAll.femalePercentage+"%|i:"+stats.overAll.internalPercentage+"%|l:"+stats.overAll.leafPercentage+"%|t:"+stats.overAll.terminationPercentage+"%",MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-40,{"size":"9px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
}

function _render(source){
	var i = 0;
	// Compute the new tree layout.
	//var nodes = tree.nodes(root).reverse(),
	// filter the nodes which have no children
	var nodes = tree.nodes(source).reverse().filter(function(d){
		if (!LEAF_NODES){
			return (d.children &&d.depth<MAX_DEPTH) ;
		}
		else{
			return (d.depth<MAX_DEPTH) ;
		}
	}),
 	links = tree.links(nodes);
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * DEPTH_WIDTH; });
  //nodes.forEach(function(d) { d.y = d.depth * 100; });
  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });
  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .on("click", click)
	  .attr("transform", function(d) {
		  return "translate(" + d.y + "," + d.x + ")"; });
		  //return "translate(" + d.x + "," + d.y + ")"; });
  nodeEnter.append("circle")
	  .attr("r",function(d){
		   return getSize(d,50,2)/2+"px";
		})
	  .style("fill", "#fff");

	nodeEnter.append("svg:image")
		.attr("xlink:href",function(d){return "/images/employees/circle/"+d.name+".png";})
		.attr("width",function(d){
		   return getSize(d,30,10)+"px";
		})
		.attr("height",function(d){
		   return getSize(d,30,10)+"px";
		})
	  .attr("transform", function(d) {
		  return "translate(" + -getSize(d,30,10)/2 + "," + -getSize(d,30,10)/2 + ")"; });

	//***** NAME ********
	// needed when we use _nest stuff instead of maketree stuff
	/*
	nodeEnter.append("text")
	  .attr("x", function(d) {
	  //.attr("y", function(d) {
		  return d.children || d._children ? -(getSize(d)+2) : (getSize(d)+2); })
		 //return d.children || d._children ? -18 : 18; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { if (d.children) return d.name; else {if (!LEAF_NAMES) return ""; else return "";} })
	  .style("fill-opacity", 1)
	  .style("font-weight", function(d){
			if (d.children) return "bold";
			else return "normal";
		  })
	  .style("font-size",function(d){
		   return getSize(d)+"px";
		});
	*/

	//***** POSITION ********
	nodeEnter.append("text")
	  .attr("x", "0")
	  .attr("dy",  function(d){
		  return -getSize(d,14)+"px";
		})
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { if (d.children) return d.costcenter+" - "+d.location; else {if (!LEAF_NAMES) return ""; else return "";} })
	  .style("fill-opacity", 1)
	  .style("font-weight", function(d){
			if (d.children) return "bold";
			else return "normal";
		  })
	  .style("font-size",function(d){
		   return getSize(d,14,5,MAX_DEPTH)+"px";
		})
 	  .style("fill",function(d){
		   var _color ="black";
		   if (d.terminationDate) _color="lightgrey";
		   return _color;
		});
	//***** EMPLOYEE ********
		nodeEnter.append("text")
	  .attr("x", function(d) {
	  //.attr("y", function(d) {
		  return d.children || d._children ? -(getSize(d)) : (getSize(d)); })
		 //return d.children || d._children ? -18 : 18; })
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { if (d.children) return d.employee; else {if (!LEAF_NAMES) return ""; else return d.employee+" ("+d.companyYears+")"+" - "+d.job+" - "+d.location;} })
	  .style("fill-opacity", 1)
	  .style("font-weight", "normal")
	  .style("font-size",function(d){
		   return getSize(d,16,5,MAX_DEPTH)/1.2+"px";
		})
	  .style("fill",function(d){
		   var _color ="black";
		   if (d.terminationDate) _color="lightgrey";
		   return _color;
		});


	//***** OVERALL ********
	  nodeEnter.append("text")
	  //13px for on screen..
	  //.attr("dx","-23px")
	  .attr("x", function(d){
		  return getSize(d)+"px";
		})
	  .attr("dy", function(d){return 5+getSize(d,20,6)*2+"px"})
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.overallReports ? d.overallReports : ""; })
	  .style("fill-opacity", 1)
	  .style("font-weight", "bold")
	  .style("fill","red")
	  .style("font-size",function(d){
		  return getSize(d,20,6)*2+"px";
		})
		.style("text-anchor","end")
	  ;

	//***** STATS ********
	  nodeEnter.append("text")
	  //13px for on screen..
	  //.attr("dx","-23px")
	  .attr("x", function(d) {
		  return d.children || d._children ? 0 : 0; })
		 // return d.children || d._children ? -18 : 18; })
	  .attr("dy", function(d){
		  return getSize(d,12,4)*.9+"px";
		})
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.overallReports ? ("[d:"+d.directReports+",l:"+d.leafOnlyReports+",a:"+d.averageSubordinates+",s:"+(d.averageDeviation?d.averageDeviation:"-")+"]") :"" })
	  .style("fill-opacity", 1)
	  .style("font-weight", "normal")
	  .style("fill","red")
	  .style("font-size",function(d){
		  return getSize(d,12)*.9+"px";
		})
		.style("text-anchor","end")
	  ;
	  //.style("writing-mode", "tb");
  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });
  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);
}


// Toggle children on click.
function click(d) {
  console.log("** click:"+d.employee+ "--------------------- overall: "+d.overallReports);
  var _root = d;
  // ~ rough formula
  HEIGHT = 500+d.overallReports*3;
  d3.select("svg").remove();
  render(_root,ORG_DATE);
}


function expandAll(items){
	for (var i in items){
		if (items[i].children)
			expandAll(items[i].children);
		else{
			items[i].children_ = items[i].children;
			items[i].children =null;
		}
	}
}
