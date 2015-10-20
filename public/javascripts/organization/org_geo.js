var width = 800;
var height = 500;

/*
var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

var projection = d3.geo.kavrayskiy7(),
    color = d3.scale.category20(),
    graticule = d3.geo.graticule();

var path = d3.geo.path()
.projection(projection);


svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

svg.append("path")
    .datum(graticule.outline)
    .attr("class", "graticule outline")
    .attr("d", path);
*/

var projection = d3.geo.orthographic()
    .scale(250)
    .clipAngle(90);

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

d3.json("/json/world-110m.json", function(world) {
  d3.tsv("/json/world-country-names.tsv", function(names) {

    console.log(world);
    console.log(names);

var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
      i = -1,
      n = countries.length;

  countries = countries.filter(function(d) {
    return names.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  (function transition() {
    d3.transition()
        .duration(1000)
        .each("start", function() {
          $('#country').text(countries[i = (i + 1) % n].name);
        })
        .tween("rotate", function() {
          var p = d3.geo.centroid(countries[i]),
              r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            c.clearRect(0, 0, width, height);
            c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
            c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
            c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
            c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
          };
        })
      .transition()
        .each("end", transition);
  })();


    /*
    var countries = topojson.feature(world, world.objects.countries).features,
          neighbors = topojson.neighbors(world.objects.countries.geometries);

      svg.selectAll(".country")
          .data(countries)
        .enter().insert("path", ".graticule")
          .attr("class", "country")
          .attr("d", path)
          .style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); })
          .on("click",function(d){console.log("clicked country: "+JSON.stringify(d));})
          .on("mouseover",function(d){console.log("hover country: ");});
    */
  });
});
