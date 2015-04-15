// global variables


// http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html

var CONTEXT="CONTEXT";



var orgData;
var orgTree;
var orgLevels;
var statLevels;

var SIZE ;
var MARGIN_LEFT = 800;
var MARGIN_TOP = 150;


//default is "hr" ... HR line superivisor
// alternative is "bp" ...business process / functional superivisor
var HIERARCHY_TYPE ="hr";

var ROLE_TYPE="position";


var MAX_DEPTH= 10;

var MAX_LEVEL;
var MAX_COUNT;

// set by multiselect box to switch data
// default
//var ORG_DATA="organization/history/";
var ORG_DATA="organization/";


//fixed distance between depth levels
var DEPTH_WIDTH = 200;

//input field to redefine root node (must match PI "Full Name")
var ROOT_NAME;// = "Mr. Thomas Priglinger";

var LEAF_NAMES = 1;
var LEAF_NODES = 0;

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


var org_date;

var _tree;

/** main entry
* called from .jade views

*/
function render(date){
	org_date = date;
	if (date){
		 ORG_DATA="organization/history/";
	}
	else{
		 ORG_DATA="organization";
	}

	console.log("** render(): date = "+date);



	d3.json(dataSourceFor(ORG_DATA+date),function(data){
	//d3.json(dataSourceFor("org2013april"),function(data){
		// that is needed for historized orgdata
		if (ORG_DATA=="organization/history/"){
			orgData = data.oItems;
		}
		else if (ORG_DATA=="organization"){
			orgData = data;
		}

		console.log("dataSourceFor(ORG_DATA+date):  "+dataSourceFor(ORG_DATA+date));



		//root = findAndreas(findNorbert(makeTree(createList(data,"Employee Number","Supervisor Employee Number"))).children);
		//root = findNorbert(makeTree(createList(data,"Employee Number","Supervisor Employee Number")));

		var _parent,_parentBase;
		if (HIERARCHY_TYPE=="hr") _parent = "Supervisor Employee Number";
		else if (HIERARCHY_TYPE=="bp") {
			_parent = "Business Process Flow Manager Employee Number";
			_parentBase = "Supervisor Employee Number";
		}

		var _list = createList(orgData,"Employee Number",_parent,_parentBase);
		console.log("[OK] createList()");
		_tree = makeTree(_list);

		if (_tree.length>0){
			console.log("[OK] makeTree()");
		}
		else{
			console.log("[FAILED] makeTree()");
		}

		root = findNorbert(_tree);
		console.log("[OK] findNorbert()"+root);



		//root = _.nest(orgData,["Location","Function"]);

		orgTree = root;


		if (ROOT_NAME) root = searchBy(orgTree,"employee",ROOT_NAME);


		console.log("***** before count");

		if (root){
			MAX_COUNT=count(root,0);
			enrich(root);

			statLevels = calculateTreeStats(root);

			SIZE=300+MAX_COUNT+(MAX_LEVEL*300);
			console.log("***** MAX_LEVEL: "+MAX_LEVEL);
			WIDTH=4000;
			HEIGHT=SIZE;

			//set current size in orgmenu
			//if (!HEIGHT_OVERRIDE) document.getElementById("input_height").value=HEIGHT;
			//else HEIGHT = getInt(HEIGHT_OVERRIDE);

			_init();
			_renderBackground(root);
			_render(root);
		}
		else{
			console.log("[hmmmmm] no root object......");
		}
	});
	//});
}

var _links;


function _init(){
	// ************** Generate the tree diagram	 *****************
	var margin = {top: MARGIN_TOP, right: 120, bottom: 20, left: MARGIN_LEFT},
		width = WIDTH - margin.right - margin.left,
		height = HEIGHT - margin.top - margin.bottom;


	tree = d3.layout.tree()
		.size([height, width]);

	diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });
		//.projection(function(d) { return [d.x, d.y]; });

	svg = d3.select("body").append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.style("background","white")
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



}

function _renderBackground(source){
	//getting tree clustered by levels
	var levels = traverseBF(source);
	MAX_LEVEL = levels.length;

	var _total = 0;
	for (var i in levels){_total+=levels[i].length;};

	console.log("* MAX DEPTH: "+levels.length+" DISTRIBUTION - TOTAL: "+_total);

	var gBack = d3.select("svg").append("g").attr("id","background");
	var _sum =0;
	var _sumFemale=0;
	var _sumLeaf =0;
	var _sumTermination = 0;
	for (var i in levels){

		var _x = (i*DEPTH_WIDTH)+MARGIN_LEFT;
		_drawLine(gBack,_x,MARGIN_TOP-50,_x,SIZE,"dashedLine");

		var _perLevel = levels[i].length;
		var _percentage = Math.round((_perLevel/_total)*100);
		var _female = getFemaleQuotient(levels[i]);
		var _internal = getInternalQuotient(levels[i]);
		var _children =0;
		var _leaf =0;
		var _terminationPercentage = 0;

		var _leafPercentage;

		_leaf = statLevels[i].leafOnly;
		_leafPercentage = Math.round((_leaf/_perLevel)*100);
		_terminationPercentage = Math.round((statLevels[i].termination/_perLevel)*100);

		_sumLeaf+=statLevels[i].leafOnly;
		_sumTermination+=statLevels[i].termination;
		_sum+=_perLevel;
		_sumFemale+=_female;

		_drawText(gBack,"N"+(MAX_LEVEL-i),_x,MARGIN_TOP-70,{"size":"24px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
		_drawText(gBack,"#"+levels[i].length,_x,MARGIN_TOP-53,{"size":"16px","color":"red","opacity":1,"anchor":"middle","weight":"bold"});
		_drawText(gBack,_percentage+"%"+"|f:"+_female+"%"+"|i:"+_internal+"%"+"|l:"+_leafPercentage+"%"+"|t:"+_terminationPercentage+"%",_x,MARGIN_TOP-40,{"size":"12px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});

		console.log(levels[i].length+" - ");
	}

	//sum

	_drawText(gBack,"SUM",MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-70,{"size":"24px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});
	_drawText(gBack,"#"+_sum,MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-53,{"size":"16px","color":"red","opacity":1,"anchor":"middle","weight":"bold"});
	_drawText(gBack,"100%"+"|f:"+getFemaleQuotient(orgData,"Gender")+"%|i:"+getInternalQuotient(orgData,"Contract Type")+"%|l:"+Math.round((_sumLeaf/_sum)*100)+"%|t:"+Math.round((_sumTermination/_sum)*100)+"%",MARGIN_LEFT-DEPTH_WIDTH,MARGIN_TOP-40,{"size":"12px","color":"red","opacity":1,"anchor":"middle","weight":"normal"});



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
		  return -getSize(d)+"px";
		})
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { if (d.children) return d[ROLE_TYPE]; else {if (!LEAF_NAMES) return ""; else return "";} })
	  .style("fill-opacity", 1)
	  .style("font-weight", function(d){
			if (d.children) return "bold";
			else return "normal";
		  })
	  .style("font-size",function(d){
		   return getSize(d,25,5)+"px";
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
	  .text(function(d) { if (d.children) return d.employee; else {if (!LEAF_NAMES) return ""; else return d.employee;} })
	  .style("fill-opacity", 1)
	  .style("font-weight", "normal")
	  .style("font-size",function(d){
		   return getSize(d,50,5)/1.2+"px";
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
		  return getSize(d)*3+"px";
		})
	  .attr("dy", "0px")
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.overallReports ? d.overallReports : ""; })
	  .style("fill-opacity", 1)
	  .style("font-weight", "bold")
	  .style("fill","red")
	  .style("font-size",function(d){
		  return getSize(d,100,6)*2+"px";
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
		  return getSize(d,100,4)*.9+"px";
		})
	  .attr("text-anchor", function(d) {
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.overallReports ? ("[d:"+d.directReports+",l:"+d.leafOnly+",a:"+d.averageSubordinates+",s:"+(d.averageDeviation?d.averageDeviation:"-")+"]") :"" })
	  .style("fill-opacity", 1)
	  .style("font-weight", "normal")
	  .style("fill","red")
	  .style("font-size",function(d){
		  return getSize(d,100)*.9+"px";
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
  ROOT_NAME = d.employee;

  // ~ rough formula
  HEIGHT = 500+d.overallReports*3;

  d3.select("svg").remove();
  render(org_date);
  return;



  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  _render(d);
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
