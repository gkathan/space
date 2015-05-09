//var chart;
var charts=[];

var _period;
var _aggregate;


function _getYear(period){
  var _split = period.split("-");
  var _year;
  if (_split.length==2){
    _year = parseInt(_split[1]);
  }
  else if (_split.length==1){
    _year = parseInt(_split[0]);
  }
  if (_year>=2014 && _year <=moment().year()) return _year;
}

function _alterPeriodByYear(period,yearDelta){
  var _year = _getYear(period)+yearDelta;
  var _split = period.split("-");
  if (_split.length==1){
    return _year;
  }
  else if (_split.length==2){
    return _split[0]+"-"+_year;
  }
  return false;
}



function init(chartId){
  nv.addGraph(function() {
    var incidents;
    var chart;
    var _chartId = chartId;//"chartP1";
    var _prio = chartId.split("chart")[1];
    _period =getUrlVars().period;
    _aggregate =getUrlVars().aggregate;

    if (_aggregate){
      _url+="?aggregate="+_aggregate;
    }

    var _colors={};
    _colors["P1"]=["#174D75","#E6EFF3"];
    _colors["P8"]=["#00b8e4","#EAF7FF"];

    console.log("prio: "+_prio+" colors: "+_colors[_prio]);
    console.log("period: "+_period);
    chart = nv.models.multiBarChart()
      .x(function(d) { return d.date })
      .y(function(d) { return d.y })
      .staggerLabels(true)
      .tooltips(true)
      .showLegend(true)
      .color(_colors[_prio])
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

    redraw(_chartId,_period,_aggregate,_prio);

    charts[chartId]=chart;
    return chart;
  });
}

/**
* prepares data to be consumable by NVd3
*/
function _prepareData(incidents,incidentsPrev,prio,period){
  var _P=[];
  var _PBase=[];
  var _PSum=0;
  var _PBaseSum=0;

  var _PPrev=[];
  var _PBasePrev=[];
  var _PSumPrev=0;
  var _PBaseSumPrev=0;

  var _year = _getYear(period);
  var _yearPrev = _getYear(_alterPeriodByYear(period,-1));

  for (var day in incidents){
    console.log("date: "+incidents[day].date+" "+prio+": "+incidents[day][prio]);
    _P.push({"date":incidents[day].date,"y":parseInt(incidents[day][prio])});
    _PSum+=parseInt(incidents[day][prio]);
  }
  console.log(prio+"Sum = "+_PSum+" "+prio+"BaseSum = "+_PBaseSum);

  for (var day in incidentsPrev){
    console.log("date: "+incidentsPrev[day].date+" "+prio+": "+incidentsPrev[day][prio]);
    //date of previous year must be "normalized" to this year ....
    _PPrev.push({"date":_alterPeriodByYear(incidentsPrev[day].date,1),"y":parseInt(incidentsPrev[day][prio])});
    _PSumPrev+=parseInt(incidentsPrev[day][prio]);
  }
  console.log(prio+"Sum = "+_PSumPrev+" "+prio+"BaseSum = "+_PBaseSumPrev);

  var incData = [{key:_year,values:_P},{key:_yearPrev,values:_PPrev}]
  return incData
}

function redraw(chartId,period,aggregate,prio) {
  var _url = "/api/space/rest/incidenttracker/"+period;
  var _urlPrev = "/api/space/rest/incidenttracker/"+_alterPeriodByYear(period,-1);

  if (aggregate){
    _url+="?aggregate="+aggregate;
    _urlPrev+="?aggregate="+aggregate;
  }

  d3.json(_url, function(data) {
    d3.json(_urlPrev, function(dataPrev) {

      d3.select('#'+chartId+' svg')
        .datum(_prepareData(data,dataPrev,prio,period))
        .transition().duration(500)
        .call(charts[chartId]);

      nv.utils.windowResize(charts[chartId].update);
    });
  });
}
