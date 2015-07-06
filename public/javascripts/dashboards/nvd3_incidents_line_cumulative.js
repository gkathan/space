//var chart;
var charts=[];

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
    if (!_aggregate) _aggregate="daily";
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
    chart = nv.models.lineWithFocusChart()
      //.useInteractiveGuideline(true)
      .x(function(d) { return d.date })
      .y(function(d) { return d.y })
      //.average(function(d) { return d.mean; })
//        .x(function(d) { return d[0] })
//        .y(function(d) { return d[1]/100 })
      .color(d3.scale.category10().range())
      //.average(function(d) { return d.mean/100; })
      .tooltips(true)
      .showLegend(true)
      .color(_colors[_prio])

chart.brushExtent([50,70]);
      //.showControls(false)
    ;
    if (_period=="") _period ="All";
    $("#period_"+_chartId).text(_period);
    $("#aggregate_"+_chartId).text(_aggregate);
    var _reduceXTicks = false;
    //if (_aggregate=="day" || _aggregate=="week") _reduceXTicks = true;

    chart.xAxis.tickFormat(function(d) {
            return d3.time.format('%m/%d/%y')(new Date(d))
        });
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
            key: "Long",
            values: [ [ 1083297600000 , -2.974623048543] , [ 1085976000000 , -1.7740300785979] , [ 1088568000000 , 4.4681318138177] , [ 1091246400000 , 7.0242541001353] , [ 1093924800000 , 7.5709603667586] , [ 1096516800000 , 20.612245065736] , [ 1099195200000 , 21.698065237316] , [ 1101790800000 , 40.501189458018] , [ 1104469200000 , 50.464679413194] , [ 1107147600000 , 48.917421973355] , [ 1109566800000 , 63.750936549160] , [ 1112245200000 , 59.072499126460] , [ 1114833600000 , 43.373158880492] , [ 1117512000000 , 54.490918947556] , [ 1120104000000 , 56.661178852079] , [ 1122782400000 , 73.450103545496] , [ 1125460800000 , 71.714526354907] , [ 1128052800000 , 85.221664349607] , [ 1130734800000 , 77.769261392481] , [ 1133326800000 , 95.966528716500] , [ 1136005200000 , 107.59132116397] , [ 1138683600000 , 127.25740096723] , [ 1141102800000 , 122.13917498830] , [ 1143781200000 , 126.53657279774] , [ 1146369600000 , 132.39300992970] , [ 1149048000000 , 120.11238242904] , [ 1151640000000 , 118.41408917750] , [ 1154318400000 , 107.92918924621] , [ 1156996800000 , 110.28057249569] , [ 1159588800000 , 117.20485334692] , [ 1162270800000 , 141.33556756948] , [ 1164862800000 , 159.59452727893] , [ 1167541200000 , 167.09801853304] , [ 1170219600000 , 185.46849659215] , [ 1172638800000 , 184.82474099990] , [ 1175313600000 , 195.63155213887] , [ 1177905600000 , 207.40597044171] , [ 1180584000000 , 230.55966698196] , [ 1183176000000 , 239.55649035292] , [ 1185854400000 , 241.35915085208] , [ 1188532800000 , 239.89428956243] , [ 1191124800000 , 260.47781917715] , [ 1193803200000 , 276.39457482225] , [ 1196398800000 , 258.66530682672] , [ 1199077200000 , 250.98846121893] , [ 1201755600000 , 226.89902618127] , [ 1204261200000 , 227.29009273807] , [ 1206936000000 , 218.66476654350] , [ 1209528000000 , 232.46605902918] , [ 1212206400000 , 253.25667081117] , [ 1214798400000 , 235.82505363925] , [ 1217476800000 , 229.70112774254] , [ 1220155200000 , 225.18472705952] , [ 1222747200000 , 189.13661746552] , [ 1225425600000 , 149.46533007301] , [ 1228021200000 , 131.00340772114] , [ 1230699600000 , 135.18341728866] , [ 1233378000000 , 109.15296887173] , [ 1235797200000 , 84.614772549760] , [ 1238472000000 , 100.60810015326] , [ 1241064000000 , 141.50134895610] , [ 1243742400000 , 142.50405083675] , [ 1246334400000 , 139.81192372672] , [ 1249012800000 , 177.78205544583] , [ 1251691200000 , 194.73691933074] , [ 1254283200000 , 209.00838460225] , [ 1256961600000 , 198.19855877420] , [ 1259557200000 , 222.37102417812] , [ 1262235600000 , 234.24581081250] , [ 1264914000000 , 228.26087689346] , [ 1267333200000 , 248.81895126250] , [ 1270008000000 , 270.57301075186] , [ 1272600000000 , 292.64604322550] , [ 1275278400000 , 265.94088520518] , [ 1277870400000 , 237.82887467569] , [ 1280548800000 , 265.55973314204] , [ 1283227200000 , 248.30877330928] , [ 1285819200000 , 278.14870066912] , [ 1288497600000 , 292.69260960288] , [ 1291093200000 , 300.84263809599] , [ 1293771600000 , 326.17253914628] , [ 1296450000000 , 337.69335966505] , [ 1298869200000 , 339.73260965121] , [ 1301544000000 , 346.87865120765] , [ 1304136000000 , 347.92991526628] , [ 1306814400000 , 342.04627502669] , [ 1309406400000 , 333.45386231233] , [ 1312084800000 , 323.15034181243] , [ 1314763200000 , 295.66126882331] , [ 1317355200000 , 251.48014579253] , [ 1320033600000 , 295.15424257905] , [ 1322629200000 , 294.54766764397] , [ 1325307600000 , 295.72906119051] , [ 1327986000000 , 325.73351347613] , [ 1330491600000 , 340.16106061186] , [ 1333166400000 , 345.15514071490] , [ 1335758400000 , 337.10259395679] , [ 1338436800000 , 318.68216333837] , [ 1341028800000 , 317.03683945246] , [ 1343707200000 , 318.53549659997] , [ 1346385600000 , 332.85381464104] , [ 1348977600000 , 337.36534373477] , [ 1351656000000 , 350.27872156161] , [ 1354251600000 , 349.45128876100]]
            ,
            mean: 250
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
      //_P.push({"date":incidents[day].date,"y":parseInt(incidents[day][dateField][prio].total)});
      _P.push({"date":day,"y":parseInt(incidents[day][dateField][prio].total)});
      _PSum+=parseInt(incidents[day][dateField][prio].total);
  }
  //console.log(prio+"Sum = "+_PSum+" "+prio+"BaseSum = "+_PBaseSum);
  var _mean = _PSum/day;

  for (var day in incidentsPrev){
      console.log("date: "+incidentsPrev[day].date+" "+prio+": "+incidentsPrev[day][dateField][prio].total);
      //date of previous year must be "normalized" to this year ....
      //_PPrev.push({"date":_alterPeriodByYear(incidentsPrev[day].date,1),"y":parseInt(incidentsPrev[day][dateField][prio].total)});
      _PPrev.push({"date":day,"y":parseInt(incidentsPrev[day][dateField][prio].total)});
      _PSumPrev+=parseInt(incidentsPrev[day][dateField][prio]);

  }
  //console.log(prio+"Sum = "+_PSumPrev+" "+prio+"BaseSum = "+_PBaseSumPrev);

  var _meanPrev = _PSumPrev/day;

  var incData = [{key:_year,values:_P,mean:_mean},{key:_yearPrev,values:_PPrev,mean:_meanPrev}]

  return incData
}

function redraw(chartId,period,aggregate,prio,dateField) {
  var _url = "/api/space/rest/incidenttracker/"+period;
  var _urlPrev = "/api/space/rest/incidenttracker/"+_alterPeriodByYear(period,-1);


  if (aggregate){
    _url+="?aggregate="+aggregate;
    _urlPrev+="?aggregate="+aggregate;
  }
  console.log("_url: "+_url);


  d3.json(_url, function(data) {
    d3.json(_urlPrev, function(dataPrev) {
      d3.select('#'+chartId+' svg')
        .datum(_prepareData(data.tracker,dataPrev.tracker,prio,period,dateField))
        //.datum(cumulativeTestData())
        .transition().duration(500)
        .call(charts[chartId]);


        $("#"+chartId+"_sum").text(data.statistics.sum[prio][dateField]);
        $("#"+chartId+"_sumPrev").text(dataPrev.statistics.sum[prio][dateField]);


      nv.utils.windowResize(charts[chartId].update);
    });
  });
}
