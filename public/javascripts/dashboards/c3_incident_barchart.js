var incidents;//={unplannedYTD:99.61,targetYTD:99.75};
var _period = "Q1-2015";

var _baselineYear = parseInt(_.last(_period.split("-")))-1;
var _baselinePeriod =_.first(_period.split("-"))+"-"+_baselineYear;

console.log("period: "+_period);
console.log("baseline period: "+_baselinePeriod);


// do a ajax call for target data period
$.get( "/api/space/rest/incidenttracker/openedAt/"+_baselinePeriod, function( dataBaseline ) {
  //and for baseline data period
  var _baselineMetrics = _calculateMetrics(dataBaseline);
  console.log("baseline P01 sum: "+_baselineMetrics.sumP01);
  console.log("baseline P08 sum: "+_baselineMetrics.sumP08);

  var _baselineString = "baseline: "+_baselinePeriod+" P01:"+_baselineMetrics.sumP01+" P08:"+_baselineMetrics.sumP08;
  $('#baseline').text(_baselineString);
  var _target = 0.25;
  var _targetString = "target: "+_period+" P01:"+(_baselineMetrics.sumP01*(1-_target))+" P08:"+(_baselineMetrics.sumP08*(1-_target));
  $('#target').text(_targetString);


  $.get( "/api/space/rest/incidenttracker/"+_period, function( data ) {

    var _metrics = _calculateMetrics(data);

    console.log("P01 sum: "+_metrics.sumP01);
    console.log(" sum: "+_metrics.sum);

    console.log("weekly aggregation: "+JSON.stringify(_metrics.weeks));
    console.log("daily aggregation: "+JSON.stringify(_metrics.days));


    var chart2 = c3.generate({
        bindto : '#c3_incident_barchart',
        size: {
          height:140,
          width:180
        },
        data: {
            json: _metrics.weeks,
            keys: {
                value: ['P01','']
            },
            type: 'bar'
        },
        axis:{
          x: {
            type:'date'
          }
        },


        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
            // or
            //width: 100 // this makes bar width 100px
        }
    });
    /*
      setTimeout(function () {
          chart2.load({
              columns: [['data1', 20, 100, 20, 200, 50, 150]]
          });
      }, 500);

      setTimeout(function () {
          chart2.load({
              columns: [['data1', 50, 140, 28, 100, 150, 120]]
          });
      }, 1000);

      setTimeout(function () {
          chart2.load({
              columns: [['data1', 120,40, 280, 120, 50, 220]]
          });
      }, 1500);


      setTimeout(function () {
          chart2.load({
                columns:  ['data1', 30, 200, 100, 400, 150, 250],
          });
      }, 2000);
      */
  });
});


function _calculateMetrics(data){
  var weeks =[];
  var days =[];

  var w =0;
  var d =0;

  var _P01_week=0;
  var _P08_week=0;

  var _P01_day=0;
  var _P08_day=0;

  var _P01_sum =0;
  var _P08_sum =0;


  for (var i in data){
    data[i].P01 = parseInt(data[i].P01);
    data[i].P08 = parseInt(data[i].P08);
    _P01_week+=data[i].P01;
    _P08_week+=data[i].P08;

    _P01_day+=data[i].P01;
    _P08_day+=data[i].P08;

    _P01_sum+=data[i].P01;
    _P08_sum+=data[i].P08;

    days[i] = {P01:_P01_day,P08:_P08_day};


    if (i % 7 ==0){
      console.log("mod 7 ==0 i:"+i);
      weeks[w] = {P01:_P01_week,P08:_P08_week};
      _P01_week=0;
      _P08_week=0;
      w++;
    }
  }

  var _metrics ={};
  _metrics.weeks = weeks;
  _metrics.days = days;

  _metrics.sumP01 = _P01_sum;
  _metrics.sumP08 = _P08_sum;

  return _metrics;
}
