nv.addGraph(function() {

  /*
  availability: [{"date":"April-2014","value":{"planned":98.49,"unplanned":98.79}},{"date":"May-2014","value":{"planned":99.21,"unplanned":99.68}},{"date":"June-2014","value":{"planned":99.15,"unplanned":99.15}},{"date":"July-2014","value":{"planned":99.69,"unplanned":99.7}},{"date":"August-2014","value":{"planned":99.88,"unplanned":99.92}},{"date":"September-2014","value":{"planned":99.94,"unplanned":99.95}},{"date":"October-2014","value":{"planned":99.4,"unplanned":99.56}},{"date":"November-2014","value":{"planned":99.8,"unplanned":99.81}},{"date":"December-2014","value":{"planned":96.62,"unplanned":98.94}},{"date":"January-2015","value":{"planned":99.87,"unplanned":99.87}},{"date":"February-2015","value":{"planned":99.01,"unplanned":99.17}},{"date":"March-2015","value":{"planned":99.63,"unplanned":99.87}}]

  */

  var incidents;//={unplannedYTD:99.61,targetYTD:99.75};
  var _period ="";
  if (window.location.search.split("=").length>1) _period="/"+_.last(window.location.search.split("="));

  console.log("period: "+_period);
  // do a ajax call
  $.get( "/api/space/rest/incidenttracker"+_period, function( data ) {
    incidents = data;

    var _P1=[];
    var _P8=[];

    var _P1Sum=0;
    var _P8Sum=0;

    //var _total=[];

    for (var day in incidents){
      console.log("date: "+incidents[day].date+" P1: "+incidents[day].P1+" P8: "+incidents[day].P8);
      _P1.push({"date":incidents[day].date,"y":parseInt(incidents[day].P1)});
      _P1Sum+=parseInt(incidents[day].P1);
      _P8.push({"date":incidents[day].date,"y":parseInt(incidents[day].P8)});
      _P8Sum+=parseInt(incidents[day].P8);
    }

    console.log("P1Sum = "+_P1Sum+" P8Sum = "+_P8Sum);

    //var avData = [{key:"Avalability bla",values:availability}]
    var incData = [{key:"P1",values:_P1},{key:"P8",values:_P8}]

    var chart = nv.models.multiBarChart()
      .x(function(d) { return d.date })
      .y(function(d) { return d.y })
      .staggerLabels(true)
      .tooltips(true)
      .showLegend(true)
      .color(["#174D75","#00b8e4","#82cec1"])
      .groupSpacing(0.2)
      .rotateLabels(45)
      .showControls(true)
    ;
    $("#P1Sum").text(_P1Sum);
    $("#P8Sum").text(_P8Sum);
    if (_period=="") _period ="All";
    $("#period").text(_period);

     //chart.focusEnable(true);
    chart.reduceXTicks(false).staggerLabels(true);

    chart.yAxis
        .tickFormat(d3.format(',d'));

    //console.log("--scaleY(50) = "+(50));


    d3.select('#chart svg')
        .datum(incData)
        .transition().duration(500)
        .call(chart)
        ;



    var _svg = d3.select("#chart svg");
    var _addon =_svg.append("g").attr("id","addons");

    console.log("scaling y(50) = "+chart.yAxis.scale()(50))
    _drawLine(_addon,0,chart.yAxis.scale()(50),1000,chart.yAxis.scale()(50),"targetLine");

    nv.utils.windowResize(chart.update);

    return chart;
    });
});
