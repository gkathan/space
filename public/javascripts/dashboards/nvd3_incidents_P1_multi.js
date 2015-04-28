//var chart;
var charts=[];

var _period;
var _aggregate;

function init(chartId){

  nv.addGraph(function() {

    var incidents;

    var chart;

    var _chartId = chartId;//"chartP1";
    var _prio = chartId.split("chart")[1];
    _period =getUrlVars().period;
    _aggregate =getUrlVars().aggregate;

    var _url = "/api/space/rest/incidenttracker/"+_period;

    if (_aggregate){
      _url+="?aggregate="+_aggregate;
    }

    var _colors=[];
    var _colorsP1=["#174D75","#00b8e4","#82cec1"];
    var _colorsP8=["#82cec1"];
    if(_prio=="P1") _colors=_colorsP1;
    else if(_prio=="P8") _colors=_colorsP8;
    //_colors["P8"]=["#00b8e4","#82cec1"];
    //_colors.P8=["#00b8e4","#82cec1"];
    //_colors.P16=["#82cec1"];

    console.log("prio: "+_prio+" colors: "+_colors[_prio]);

    console.log("period: "+_period);
    // do a ajax call
    $.get( _url, function( data ) {

      chart = nv.models.multiBarChart()
        .x(function(d) { return d.date })
        .y(function(d) { return d.y })
        .staggerLabels(true)
        .tooltips(true)
        .showLegend(true)
        .color(_colors)
        .groupSpacing(0.2)
        .rotateLabels(45)
        .showControls(false)
      ;
      if (_period=="") _period ="All";
      $("#period_"+_chartId).text(_period);
      $("#aggregate_"+_chartId).text(_aggregate);

      var _reduceXTicks = false;
      if (_aggregate=="daily") _reduceXTicks = true;

      chart.reduceXTicks(_reduceXTicks).staggerLabels(true);

      chart.yAxis
          .tickFormat(d3.format(',d'));

      //console.log("--scaleY(50) = "+(50));

      redraw(_chartId,_period,_aggregate,_prio);

/*
        d3.select('#'+_chartId+' svg')
          .datum(_prepareData(data))
          .transition().duration(500)
          .call(chart)
          ;


  /*
      var _svg = d3.select("#chartP1 svg");
      var _addon =_svg.append("g").attr("id","addons");

      console.log("scaling y(50) = "+chart.yAxis.scale()(50))
      _drawLine(_addon,0,chart.yAxis.scale()(50),1000,chart.yAxis.scale()(50),"targetLine");
  */
      //nv.utils.windowResize(chart.update);
      charts[chartId]=chart;
      return chart;
      });
  });


}


function _prepareData(incidents,prio){
  var _P=[];
  var _PBase=[];

  var _PSum=0;
  var _PBaseSum=0;


  for (var day in incidents){
    console.log("date: "+incidents[day].date+" "+prio+": "+incidents[day][prio]);
    _P.push({"date":incidents[day].date,"y":parseInt(incidents[day][prio])});
    _PSum+=parseInt(incidents[day][prio]);
  }

  console.log(prio+"Sum = "+_PSum+" "+prio+"BaseSum = "+_PBaseSum);

  var incData = [{key:prio,values:_P}];//,{key:"P1Base",values:_P1Base}]

  return incData
}

function redraw(chartId,period,aggregate,prio) {
  var _url = "/api/space/rest/incidenttracker/"+period;
  if (aggregate){
    _url+="?aggregate="+aggregate;
  }

  d3.json(_url, function(data) {

    d3.select('#'+chartId+' svg')
      .datum(_prepareData(data,prio))
      .transition().duration(500)
      .call(charts[chartId]);

    nv.utils.windowResize(charts[chartId].update);
  });
}
