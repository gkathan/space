nv.addGraph(function() {

  var incidents;

  var _chartId = "chartTest";
  var _period =getUrlVars().period;
  var _aggregate =getUrlVars().aggregate;

  var _url = "/api/space/rest/incidenttracker/"+_period;

  if (_aggregate){
    _url+="?aggregate="+_aggregate;
  }


  console.log("period: "+_period);
  // do a ajax call
  $.get( _url, function( data ) {
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
    $("#period_"+_chartId).text(_period);
    $("#aggregate_"+_chartId).text(_aggregate);

    var _reduceXTicks = false;
    if (_aggregate=="daily") _reduceXTicks = true;

    chart.reduceXTicks(_reduceXTicks).staggerLabels(true);


    chart.yAxis
        .tickFormat(d3.format(',d'));

    //console.log("--scaleY(50) = "+(50));


    d3.select('#'+_chartId+' svg')
        .datum(incData)
        .transition().duration(500)
        .call(chart)
        ;


/*
    var _svg = d3.select("#chart svg");
    var _addon =_svg.append("g").attr("id","addons");

    console.log("scaling y(50) = "+chart.yAxis.scale()(50))
    _drawLine(_addon,0,chart.yAxis.scale()(50),1000,chart.yAxis.scale()(50),"targetLine");
*/
    nv.utils.windowResize(chart.update);

    return chart;
    });
});
