nv.addGraph(function() {

  /*
  availability: [{"date":"April-2014","value":{"planned":98.49,"unplanned":98.79}},{"date":"May-2014","value":{"planned":99.21,"unplanned":99.68}},{"date":"June-2014","value":{"planned":99.15,"unplanned":99.15}},{"date":"July-2014","value":{"planned":99.69,"unplanned":99.7}},{"date":"August-2014","value":{"planned":99.88,"unplanned":99.92}},{"date":"September-2014","value":{"planned":99.94,"unplanned":99.95}},{"date":"October-2014","value":{"planned":99.4,"unplanned":99.56}},{"date":"November-2014","value":{"planned":99.8,"unplanned":99.81}},{"date":"December-2014","value":{"planned":96.62,"unplanned":98.94}},{"date":"January-2015","value":{"planned":99.87,"unplanned":99.87}},{"date":"February-2015","value":{"planned":99.01,"unplanned":99.17}},{"date":"March-2015","value":{"planned":99.63,"unplanned":99.87}}]

  */

  var availability;//={unplannedYTD:99.61,targetYTD:99.75};

  // do a ajax call
  $.get( "/api/space/rest/availability", function( data ) {
    availability = data[0].avReport.GetAVGraphDatapoints;

    var _planned=[];
    var _unplanned=[];
    var _total=[];

    for (var month in availability){
      console.log("date: "+availability[month].date+" value.planned: "+availability[month].value.planned+" value.unplanned: "+availability[month].value.unplanned);
      _planned.push({"date":availability[month].date,"y":availability[month].value.planned});
      _unplanned.push({"date":availability[month].date,"y":availability[month].value.unplanned});
      _total.push({"date":availability[month].date,"y":(availability[month].value.unplanned*availability[month].value.planned)/100});
    }

    console.log("availability: "+JSON.stringify(availability));

    //var avData = [{key:"Avalability bla",values:availability}]
    var avData = [{key:"planned",values:_planned},{key:"unplanned",values:_unplanned},{key:"total",values:_total}]

    var chart = nv.models.multiBarChart()
      .x(function(d) { return d.date })
      .y(function(d) { return d.y })
      .staggerLabels(true)
      .tooltips(true)
      .showLegend(true)
      .color(["#174D75","#00b8e4","#82cec1"])
      .groupSpacing(0.2)
      .rotateLabels(45)
      .showControls(false)

    ;

    console.log("data: "+JSON.stringify(data));

    chart.forceY([96,98,100])

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#chart2 svg')
        .datum(avData)
        .transition().duration(500)
        .call(chart)
        ;

    nv.utils.windowResize(chart.update);

    return chart;
    });
});
