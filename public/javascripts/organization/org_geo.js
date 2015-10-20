var w = 1000;
var h = 500;
var svg = d3.select("body").append("svg")
.attr("width", w)
.attr("height", h);

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

d3.json("/json/world-110m.json", function(world) {
console.log(world);

var countries = topojson.feature(world, world.objects.countries).features,
      neighbors = topojson.neighbors(world.objects.countries.geometries);

  svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); });
});
