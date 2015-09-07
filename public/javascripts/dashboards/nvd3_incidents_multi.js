//var chart;
var charts=[];
var _url;

var _period;
var _aggregate;
var _dateField;//="openedAt";

function _getYear(period){
  //console.log("**** getYear() called: period: "+period);
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
    return _year.toString();
  }
  else if (_split.length==2){
    return _split[0]+"-"+_year;
  }
  return false;
}



function init(prio,dateField,chartId,subDimension,customer){
  console.log("******** init: customer: "+customer);

  _dateField = dateField;
  nv.addGraph(function() {
    var incidents;
    var chart;
    var _chartId = chartId;//"chartP1";
    var _prio = prio;//chartId.split("chart")[1];
    _period =getUrlVars().period;
    if (!_period) _period=moment().year().toString();
    _aggregate =getUrlVars().aggregate;
    if (_aggregate){
      _url+="?aggregate="+_aggregate;
    }
    if (!_aggregate) _aggregate="month";
    var _colors={};
    // #ED1C24	#EF333A	#F14A50	#F36166	#F5787C	#F78F92	#F9A6A8	#FBBDBE	#FDD4D4	#FFEBEA	#FFFFFF
    _colors["P01"]=["#ED1C24","#FDD4D4"];
    // #F7931D	#F89E34	#F9A94B	#FAB462	#FBBF79	#FCCA90	#FDD5A7	#FEE0BE	#FFEBD5	#FFF6EC	#FFFFFF
    _colors["P08"]=["#F7931D","#FFEBD5"];
    // #38A4DC	#4CADE0	#60B6E4	#74BFE8	#88C8EC	#9CD1F0	#B0DAF4	#C4E3F8	#D8ECFC	#ECF5FF	#FFFFFF
    _colors["P16"]=["#38A4DC","#D8ECFC"];
    _colors["P120"]=["#aaaaaa","#efefef"];
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
    //if (_aggregate=="day" || _aggregate=="week") _reduceXTicks = true;
    _reduceXTicks = true;
    chart.reduceXTicks(_reduceXTicks).staggerLabels(true);
    chart.yAxis
        .tickFormat(d3.format(',d'));
    redraw(_chartId,_period,_aggregate,_prio,dateField,customer);

    //function pointer
    charts[chartId]=chart;
    return chart;
  });



  // clickhandler for
	$('a.dropdown.incidentstrend').click( function(event) {
    var _prio =event.target.id.split("_")[0].split("chart")[1].split("-")[0];
    var _chart=event.target.id.split("_")[0];
    var _dateField = _chart.split("-")[1];

		if (_.startsWith(event.target.id.split("_")[1],"aggregate")){
			_aggregate =event.target.id.split("_")[1].split("-")[1];
		}
		else
		{
			_period = event.target.id.split("_")[1];
		}
    console.log("######################### ____id: "+event.target.id);
    console.log("######################### chart: "+_chart);
    console.log("######################### _dateField: "+_dateField);

		$("#period_"+_chart).text(_period);
		$("#aggregate_"+_chart).text(_aggregate);
		redraw(_chart,_period,_aggregate,_prio,_dateField);
	});


}

/**
* prepares data to be consumable by NVd3
*/
function _prepareData(incidents,incidentsPrev,prio,period,dateField){
  /*
  console.log("----------------- _prepareData: prio= "+prio);
  console.log("----------------- _prepareData: period= "+period);
  console.log("----------------- _prepareData: dateField= "+dateField);
  console.log("----------------- _prepareData: incidents[0]="+JSON.stringify(incidents[0]));
*/
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
      /*
      console.log(JSON.stringify(incidents[day]));
      console.log("++ dateField: "+dateField);
      console.log("++ prio: "+prio);
      console.log("date: "+incidents[day].date+" "+prio+": "+incidents[day][dateField][prio].total);
      */
      _P.push({"date":incidents[day].date,"y":parseInt(incidents[day][dateField][prio].total)});
      _PSum+=parseInt(incidents[day][dateField][prio].total);
  }
  //console.log(prio+"Sum = "+_PSum+" "+prio+"BaseSum = "+_PBaseSum);

  for (var day in incidentsPrev){
      //console.log("date: "+incidentsPrev[day].date+" "+prio+": "+incidentsPrev[day][dateField][prio].total);
      //date of previous year must be "normalized" to this year ....
      _PPrev.push({"date":_alterPeriodByYear(incidentsPrev[day].date,1),"y":parseInt(incidentsPrev[day][dateField][prio].total)});
      _PSumPrev+=parseInt(incidentsPrev[day][dateField][prio]);

  }
  var incData = [{key:_year,values:_P},{key:_yearPrev,values:_PPrev}]

  return incData
}

function redraw(chartId,period,aggregate,prio,dateField,customer) {
  var _baseUrl = "/api/space/rest/incidenttracker";
  if (customer) _baseUrl+="/"+customer;
  _baseUrl+="?true=true";

  var _url;
  var _urlPrev;

  if (aggregate){
    _url=_baseUrl+"&aggregate="+aggregate;
    _urlPrev=_baseUrl+"&aggregate="+aggregate;
  }
  if (period){
    _url+="&period="+period;
    _urlPrev+="&period="+_alterPeriodByYear(period,-1);
  }


  console.log("_url: "+_url);


  d3.json(_url, function(data) {
    d3.json(_urlPrev, function(dataPrev) {
      d3.select('#'+chartId+' svg')
        .datum(_prepareData(data.tracker,dataPrev.tracker,prio,period,dateField))
        .transition().duration(500)
        .call(charts[chartId]);


        $("#"+chartId+"_sum").text(data.statistics.sum[prio][dateField]);
        $("#"+chartId+"_sumPrev").text(dataPrev.statistics.sum[prio][dateField]);


      nv.utils.windowResize(charts[chartId].update);
    });
  });
}
