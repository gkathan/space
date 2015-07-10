//var chart;
var charts=[];

var _period;
var _aggregate;
var _dateField;//="openedAt";

function init(prio,dateField,chartId,subDimension){
  _dateField = dateField;
  nv.addGraph(function() {
    var incidents;
    var chart;
    var _chartId = chartId;//"chartP1";
    var _prio = prio;//chartId.split("chart")[1];

    chart = nv.models.stackedAreaChart()
      //.x(function(d) { return new Date(d.timestamp).getTime() })
      //.y(function(d) { return d.totals.P01 })
      .x(function(d) { return d[0]  })
      .y(function(d) { return d[1]  })
      .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
      .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
      .controlLabels({stacked: "Stacked"})
      
      .showControls(true);       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.

    chart.xAxis
        .tickFormat(function(d) {
          return d3.time.format("%x %X")(new Date(d))
    });
    chart
      .yAxis.tickFormat(d3.format(',d'));


    redraw(_chartId,_period,_aggregate,_prio,dateField,subDimension);

    //function pointer
    charts[chartId]=chart;
    return chart;
  });

}

/**
* prepares data to be consumable by NVd3
*/
function _prepareData(ticker){
  var _prios = ["P01","P08","P16","P120"];

  var _colors={};
  _colors["P01"]=["#ED1C24"];
  _colors["P08"]=["#F7931D"];
  _colors["P16"]=["#38A4DC"];
  _colors["P120"]=["#aaaaaa"];

  var _data =[];

  for (var p in _prios){
    var _item={};
    var _prio = _prios[p];
    _item.key=_prio;
    _item.values=[];
    _item.color=_colors[_prio];
    for (var d in ticker){
      var _date = new Date(ticker[d].timestamp).getTime();
      _item.values.push([_date,ticker[d].totals[_prio]-ticker[d].totalsResolved[_prio]]);
    }
    _data.push(_item);
  }
  return _data;
}

function redraw(chartId) {
  var _url = "/api/space/rest/incidentsactiveticker";
  console.log("_url: "+_url);
  d3.json(_url, function(data) {
      d3.select('#'+chartId+' svg')
        .datum(_prepareData(data))
        //.datum(data)
        .transition().duration(500)
        .call(charts[chartId])
      nv.utils.windowResize(charts[chartId].update);
  });
}
