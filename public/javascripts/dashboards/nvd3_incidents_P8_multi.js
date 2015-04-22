nv.addGraph(function() {

  var incidents;
  var _period ="";
  if (window.location.search.split("=").length>1) _period="/"+_.last(window.location.search.split("="));

  console.log("period: "+_period);
  // do a ajax call
  $.get( "/api/space/rest/incidenttracker"+_period, function( data ) {
    incidents = data;

    var _P8=[];
    var _P8Base=[];

    var _P8Sum=0;
    var _P8BaseSum=0;


    for (var day in incidents){
      console.log("date: "+incidents[day].date+" P8: "+incidents[day].P8+" P8: "+incidents[day].P8);
      _P8.push({"date":incidents[day].date,"y":parseInt(incidents[day].P8)});
      _P8Sum+=parseInt(incidents[day].P1);
      _P8Base.push({"date":incidents[day].date,"y":parseInt(incidents[day].P8)});
      _P8BaseSum+=parseInt(incidents[day].P8);
    }

    console.log("P8Sum = "+_P8Sum+" P8BaseSum = "+_P8BaseSum);

    var incData = [{key:"P8",values:_P8},{key:"P8Base",values:_P8Base}]

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
    $("#P8Sum").text(_P8Sum);
    $("#P8BaseSum").text(_P8BaseSum);
    if (_period=="") _period ="All";
    $("#period").text(_period);

     //chart.focusEnable(true);
    chart.reduceXTicks(true).staggerLabels(true);

    chart.yAxis
        .tickFormat(d3.format(',d'));

    //console.log("--scaleY(50) = "+(50));


    d3.select('#chartP8 svg')
        .datum(incData)
        .transition().duration(500)
        .call(chart)
        ;



    var _svg = d3.select("#chartP8 svg");
    var _addon =_svg.append("g").attr("id","addons");

    console.log("scaling y(50) = "+chart.yAxis.scale()(50))
    _drawLine(_addon,0,chart.yAxis.scale()(50),1000,chart.yAxis.scale()(50),"targetLine");

    nv.utils.windowResize(chart.update);

    return chart;
    });
});
