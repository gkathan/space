var incidents;//={unplannedYTD:99.61,targetYTD:99.75};
var _period = "Q2-2015";

//var _baselineYear = parseInt(_.last(_period.split("-")))-1;
//var _baselinePeriod =_.first(_period.split("-"))+"-"+_baselineYear;


var _baselinePeriod ="Q4-2014";


console.log("------------------------------- c3_incident_barchart period: "+_period);
console.log("baseline period: "+_baselinePeriod);

var _url = "/api/space/rest/incidenttracker/"+_period+"?aggregate=daily";
var _urlBaseline = "/api/space/rest/incidenttracker/"+_baselinePeriod+"?aggregate=daily";

console.log("---------------- url: "+_url);

// do a ajax call for target data period
$.get( _url, function( data ) {
  //and for baseline data period
  var _metrics = _calculateMetrics(data);
  console.log("target P01 sum: "+_metrics.sumP01);
  console.log("target P08 sum: "+_metrics.sumP08);



  $.get( _urlBaseline, function( baselineData ) {

    var _baselineMetrics = _calculateMetrics(baselineData);

    console.log("baseline P01 sum: "+_baselineMetrics.sumP01);
    console.log(" sum: "+_baselineMetrics.sum);

    console.log("weekly aggregation: "+JSON.stringify(_baselineMetrics.weeks));
    console.log("daily aggregation: "+JSON.stringify(_baselineMetrics.days));

    var _baselineString = "<b>"+_baselinePeriod+"</b><img src='/images/incidents/P01.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:14px'>"+_baselineMetrics.sumP01+"</b> <img src='/images/incidents/P08.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:14px'>"+_baselineMetrics.sumP08+"</b>";
    $('#baseline').html(_baselineString);

    var _targetP01= (_baselineMetrics.sumP01-(_baselineMetrics.sumP01*0.2)).toFixed(0);
    var _targetP08= (_baselineMetrics.sumP08-(_baselineMetrics.sumP08*0.2)).toFixed(0);


    var _trendP01 = (-(1-(_metrics.sumP01/_baselineMetrics.sumP01)).toFixed(2)*100)
    if (_trendP01>0) _trendP01="+"+_trendP01+"%";
    else _trendP01=_trendP01+"%";

    var _trendP08 = (-(1-(_metrics.sumP08/_baselineMetrics.sumP08)).toFixed(2)*100);
    if (_trendP08>0) _trendP08="+"+_trendP08+"%";
    else _trendP08=_trendP08+"%";

    var _targetString = "<b>"+_period+"</b><img src='/images/incidents/P01.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:14px'>"+_metrics.sumP01+"</b> <img src='/images/incidents/P08.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:14px'>"+_metrics.sumP08+"</b>";
    _targetString+="<br> P01 target: "+_targetP01+" P08 target: "+_targetP08;
    _targetString+="<br> P01 trend: "+_trendP01+" P08 trend: "+_trendP08;




    $('#target').html(_targetString);


    var chart2 = c3.generate({
        bindto : '#c3_incident_barchart',
        size: {
          height:140,
          width:180
        },
        data: {
            json: _metrics.weeks,
            keys: {
                value: ['P01','P08']
            },
            colors: {
              P01: '#FF3333',
              P08: '#FF9933'

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

  data=data.tracker;
  var dateField="openedAt";

  console.log("data: "+JSON.stringify(data));

  var w =0;
  var d =0;

  var _P01_week=0;
  var _P08_week=0;

  var _P01_day=0;
  var _P08_day=0;

  var _P01_sum =0;
  var _P08_sum =0;


  for (var i in data){
    console.log("+++++ "+  JSON.stringify(data[i]));

    data[i][dateField].P01.total = parseInt(data[i][dateField].P01.total);
    data[i][dateField].P08.total = parseInt(data[i][dateField].P08.total);
    _P01_week+=data[i][dateField].P01.total;
    _P08_week+=data[i][dateField].P08.total;



    _P01_day+=data[i][dateField].P01.total;
    _P08_day+=data[i][dateField].P08.total;

    _P01_sum+=data[i][dateField].P01.total;
    _P08_sum+=data[i][dateField].P08.total;

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
