//var chart;
var charts=[];

var _period;
var _aggregate;
var _dateField;//="openedAt";





function init(prio,dateField,chartId){
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
    if (!_aggregate) _aggregate="monthly";

    console.log("period: "+_period);
    chart = nv.models.multiBarChart()
      .x(function(d) { return d.date })
      .y(function(d) { return d.y })
      .staggerLabels(true)
      .tooltips(true)
      .showLegend(false)
      .groupSpacing(0.2)
      .rotateLabels(45)
      .showControls(true)
    ;
    if (_period=="") _period ="All";
    $("#period_"+_chartId).text(_period);
    $("#aggregate_"+_chartId).text(_aggregate);
    var _reduceXTicks = false;
    //if (_aggregate=="daily" || _aggregate=="weekly") _reduceXTicks = true;
    _reduceXTicks = true;
    chart.reduceXTicks(_reduceXTicks).staggerLabels(true);
    chart.yAxis
        .tickFormat(d3.format(',d'));
    redraw(_chartId,_period,_aggregate,_prio,dateField);

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
function _prepareData(tracker,prio,period,dateField){
  console.log("----------------- _prepareData: prio= "+prio);
  console.log("----------------- _prepareData: period= "+period);
  console.log("----------------- _prepareData: dateField= "+dateField);
  //assignmentGroup clustered
  var agData=[];
  var aGroups=[];
  var dates=[];

  for (var d in tracker){
    var _date = tracker[d].date;
    if (dates.indexOf(_date)<0){
      dates.push(_date);
    }
    console.log("--- date: "+_date);
    console.log("--- tracker: "+JSON.stringify(tracker[d]));
      for (var a in _.keys(tracker[d][dateField][prio].assignmentGroup)){
        var _ag = _.keys(tracker[d][dateField][prio].assignmentGroup)[a];
        // track all distinc assignment groups
        if (aGroups.indexOf(_ag)<0){
          aGroups.push(_ag);
        }
        console.log("---------------assignmentGroup: "+_ag+" count: "+tracker[d][dateField][prio].assignmentGroup[_ag]);

        var _aGroup = _.findWhere(agData,{"key":_ag});
        if (!_aGroup){
          agData.push({key:_ag,values:[]});
        }
        _.findWhere(agData,{"key":_ag}).values.push({date:_date,y:tracker[d][dateField][prio].assignmentGroup[_ag]})
      }
  }



  // incData: [{"key":2015,"values":[{"date":"cw27-2015","y":2}]},{"key":2014,"values":[{"date":"cw27-2015","y":6},{"date":"cw28-2015","y":4},{"date":"cw29-2015","y":4},{"date":"cw30-2015","y":3},{"date":"cw31-2015","y":2},{"date":"cw32-2015","y":2},{"date":"cw33-2015","y":3},{"date":"cw34-2015","y":1},{"date":"cw35-2015","y":4},{"date":"cw36-2015","y":0},{"date":"cw37-2015","y":3},{"date":"cw38-2015","y":7},{"date":"cw39-2015","y":8},{"date":"cw40-2015","y":2}]}]
  // incData[[{"assignmentGroup":"Sports CRM and Promo","y":1},{"assignmentGroup":"LO-International Hyderabad (LO-INT-HYD)","y":6},{"assignmentGroup":"LO-Social","y":1},{"assignmentGroup":"LO-Core (LO-CORE)","y":1},{"assignmentGroup":"LO-Sports B2C (LO-B2C)","y":4},{"assignmentGroup":"BPTY Information Security","y":1},{"assignmentGroup":"LO-Sports POS (webs and engine)","y":1},{"assignmentGroup":"Infra Ops Network","y":6},{"assignmentGroup":"LO-Casino (LO-CAS)","y":2},{"assignmentGroup":"SOC","y":4},{"assignmentGroup":"LO-Sports Trading, Content, Security","y":1},{"assignmentGroup":"LO-CRM (LO-CRM)","y":3},{"assignmentGroup":"SOC","y":2},{"assignmentGroup":"LO-International Hyderabad (LO-INT-HYD)","y":6},{"assignmentGroup":"LO-FireChiefs (LO-FIR)","y":1},{"assignmentGroup":"LO-Casino (LO-CAS)","y":3},{"assignmentGroup":"Infra Ops Network","y":2},{"assignmentGroup":"Mobile Casino & Games","y":2},{"assignmentGroup":"LO-Sports POS (webs and engine)","y":1},{"assignmentGroup":"CQR Tech Ops","y":1},{"assignmentGroup":"Infra Ops Unix","y":2},{"assignmentGroup":"US-TechOps","y":1},{"assignmentGroup":"LO-Poker (LO-POK)","y":1},{"assignmentGroup":"Bwin Casino Ops & CRM","y":1},{"assignmentGroup":"LO-Sports Trading, Content, Security","y":1},{"assignmentGroup":"Database Development","y":1},{"assignmentGroup":"LO-Sports B2C (LO-B2C)","y":2},{"assignmentGroup":"LO-International Hyderabad (LO-INT-HYD)","y":6},{"assignmentGroup":"SOC","y":3},{"assignmentGroup":"LO-CRM (LO-CRM)","y":2},{"assignmentGroup":"Infra Ops Oracle DB En
  // gData[{"key":"Sports CRM and Promo","values":[]},{"key":"LO-International Hyderabad (LO-INT-HYD)","values":[{"date":"February-2015","y":6},{"date":"March-2015","y":6},{"date":"April-2015","y":1}]},

  var agSorted = [];
  // fill with 0 oobjects..
  // needed to have  consecutive date objects in value arrays
  for (var ag in aGroups){
    var _aGroup = aGroups[ag];
    agSorted.push({key:_aGroup,values:[]});
    for (var d in dates){
      var _date = dates[d];
      var _g = _.findWhere(agData,{"key":_aGroup})
      if (!_.findWhere(_g.values,{"date":_date})){
        _.findWhere(agSorted,{"key":_aGroup}).values.push({date:_date,y:0});
      }
      else {
        _.findWhere(agSorted,{"key":_aGroup}).values.push(_.findWhere(_g.values,{"date":_date}));
      }
    }
  }




  console.log("================== agData"+JSON.stringify(agData));
  console.log("================== aGroups: "+aGroups.length+" items: "+JSON.stringify(aGroups));
  console.log("================== dates: "+dates.length+" items: "+JSON.stringify(dates));

  console.log("================== agSorted"+JSON.stringify(agSorted));



  return agSorted;
}

function redraw(chartId,period,aggregate,prio,dateField) {
  var _url = "/api/space/rest/incidenttracker/"+period;

  if (aggregate){
    _url+="?aggregate="+aggregate;
  }
  console.log("_url: "+_url);

  d3.json(_url, function(data) {
      d3.select('#'+chartId+' svg')
        .datum(_prepareData(data.tracker,prio,period,dateField))
        .transition().duration(500)
        .call(charts[chartId]);

        $("#"+chartId+"_sum").text(data.statistics.sum[prio][dateField]);

      nv.utils.windowResize(charts[chartId].update);
  });
}
