nv.addGraph(function() {

  var incidents;
  var _period ="";
  if (window.location.search.split("=").length>1) _period="/"+_.last(window.location.search.split("="));

  console.log("period: "+_period);
  // do a ajax call
  $.get( "/api/space/rest/incidenttracker"+_period, function( data ) {
    incidents = data;

    var _P1=[];
    var _P1Base=[];

    var _P1Sum=0;
    var _P1BaseSum=0;


    for (var day in incidents){
      console.log("date: "+incidents[day].date+" P1: "+incidents[day].P1+" P1: "+incidents[day].P1);
      _P1.push({"date":incidents[day].date,"y":parseInt(incidents[day].P1)});
      _P1Sum+=parseInt(incidents[day].P1);
      _P1Base.push({"date":incidents[day].date,"y":parseInt(incidents[day].P1)});
      _P1BaseSum+=parseInt(incidents[day].P1);
    }

    console.log("P1Sum = "+_P1Sum+" P1BaseSum = "+_P1BaseSum);

    var incData = [{key:"P1",values:_P1},{key:"P1Base",values:_P1Base}]

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
    $("#P1BaseSum").text(_P1BaseSum);
    if (_period=="") _period ="All";
    $("#period").text(_period);

     //chart.focusEnable(true);
    chart.reduceXTicks(true).staggerLabels(true);

    chart.yAxis
        .tickFormat(d3.format(',d'));

    //console.log("--scaleY(50) = "+(50));


    d3.select('#chartP1 svg')
        .datum(incData)
        .transition().duration(500)
        .call(chart)
        ;



    var _svg = d3.select("#chartP1 svg");
    var _addon =_svg.append("g").attr("id","addons");

    console.log("scaling y(50) = "+chart.yAxis.scale()(50))
    _drawLine(_addon,0,chart.yAxis.scale()(50),1000,chart.yAxis.scale()(50),"targetLine");

    nv.utils.windowResize(chart.update);

    return chart;
    });
});
