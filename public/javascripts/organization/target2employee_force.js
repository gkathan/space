	var data,root;

  var padding = 6, // separation between nodes
   maxRadius = 12;

	//default
	var width=3000;
	var height=3000;

	var _charge=0;
	var _distance=20;

	if(_pickL2){
		width = 1000
		height = 1000;
		_charge = -50;
		_distance = 100;
	}
	var force = d3.layout.force()
		.charge(_charge)
		.linkDistance(_distance)
		.size([width, height]);
	var svg = d3.select("#broccoli").append("svg").attr("width", width).attr("height", height);

	var nodes,links;

	var _dataUri = "/api/space/rest/employeebytargets?period="+_period+"&pickL2="+_pickL2+"&showEmployeeTree="+_showEmployeeTree+"&showTargetTree="+_showTargetTree;
	var _orgUri = "/api/space/rest/organization";
	//var _targetUri = "/api/space/rest/targets/"+_period;

	console.log("...uri: "+_dataUri);

	d3.json(_orgUri,function(organization){
		d3.json(_dataUri,function(data){
			root = data[0].children[0];
			nodes = flatten(root),
			links = d3.layout.tree().links(nodes);
			force.nodes(nodes).links(links).start();

			var drag = force.drag()
    		.on("dragstart", dragstart);

			var link = svg.selectAll(".link").data(links).enter().append("line").attr("class", "link").style("stroke-width", function(d) { return Math.sqrt(d.value); });

			var i=0;
			var node = svg.selectAll("node").data(nodes).enter().append("g").each(function(d){
				// items on leaf level
				if (!d.children){
					var _w = 100/5;
					var _h = 125/5;
					var _x = -(_w/2);
					var _y =0;//(_h-15);
					var _weight="normal";
					if (d.type=="target") _weight="bold";

					d3.select(this).append("text").text(function(d){return d.name+" "+d.id}).style("font-size","6px").style("font-weight",_weight).style("font-family","arial").attr("dy",_h+8).style("text-anchor","middle");

					var _imageSource="/images/employees/circle/";
					var _imageExtension =".png";

					d3.select(this).append("svg:image").attr("xlink:href", function(d){return _imageSource+d.id+_imageExtension;}).attr("imageID",d.id).attr("x", _x).attr("y", _y).attr("width", _w).attr("height", _h);
				}
				else{
					//not leaf
					console.log("***** has children: "+d.name+" i: "+i+" x,y "+d.x+" , "+d.y);

				 	var _weight="normal";
					var _color ="limegreen";
					var _circleColor ="lightgrey";
					var _fontSize=8;
					var _size = 10;
					var _text ="";
					var _color="black";
					var _dy=10;

					if (d.type=="L2target") _weight="bold";
					if (d.name=="bpty.studios") _color="grey";


					var _split = d.name.split(".");

					//headnode
					if (_split.length>1){
						console.log("XXXXXXXXXXXXXXXXXXXXXXX split = "+_split+" from: "+d.name);
						if (_.startsWith(_split[0],"R")) _circleColor="#00b8e4";
						if (_.startsWith(_split[0],"G")) _circleColor="#82cec1";
						if (_.startsWith(_split[0],"T")) _circleColor="#f99d1c";
						_weight="bold";
						_fontSize = 20;
						_size=15;
						_text = d.name+" - "+d.target;
						_color =_circleColor;
						_dy =-10;
				 	}
					else {
						_text =d.name;
						_fontSize=12;
						_weight="bold";
					}
					if (d.size) _size = d.size;

					d3.select(this).append("circle").attr("class", "node").attr("r", function(d){return _size/2;}).style("fill", _circleColor);
					d3.select(this).append("text").text(_text).style("font-size",_fontSize+"px").style("font-family","arial").style("font-weight",_weight).attr("dy",_dy).style("text-anchor","middle").style("fill",_color);

				}//end else not leaf
				d3.select(this)
					.call(drag)
					.on("dblclick", dblclick);

				d3.select(this).append("title").text(function(d) { return d.name; });
				i++;


				force.on("tick", function(e) {
					// Push sources up and targets down to form a weak tree.
					/*
					var k = 6 * e.alpha;
					links.forEach(function(d, i) {
						d.source.y -= k;
						d.target.y += k;
					});
					 node.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
					*/


					link.attr("x1", function(d) { return d.source.x; }).attr("y1", function(d) { return d.source.y; }).attr("x2", function(d) { return d.target.x; }).attr("y2", function(d) { return d.target.y; });
					var _size;
					if (d.size) _size=d.size/10;
					else _size = 1;
					node.attr("transform",function(d){return "translate ("+d.x+","+d.y+") scale("+_size+")"});



					/* multiforce
					d3.selectAll()
		      .each(gravity(.2 * e.alpha))
		      .each(collide(.5))
		      .attr("cx", function(d) { return d.x; })
		      .attr("cy", function(d) { return d.y; });
					*/
				});
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

	function dblclick(d) {
  	console.log("doubleclick !");
		d3.select(this).classed("fixed", d.fixed = false);
	}

	function dragstart(d) {
	  console.log("dragstart !");
		d3.select(this).classed("fixed", d.fixed = true);
	}

//------------ multi-force ------------

	// Move nodes toward cluster focus.
	function gravity(alpha) {
	  return function(d) {
	    d.y += (d.cy - d.y) * alpha;
	    d.x += (d.cx - d.x) * alpha;
	  };
	}

	// Resolve collisions between nodes.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
	    var r = d.radius + maxRadius + padding,
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}
