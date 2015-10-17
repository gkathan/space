var incidents;//={unplannedYTD:99.61,targetYTD:99.75};

_url = "api/space/rest/incidentskpis";

console.log("---------------- url: "+_url);

// do a ajax call for target data period
$.get( _url, function( data ) {
  //and for baseline data period

  /* {"baseline":{"kpis":{
      "P01":{"New":0,"In progress":0,"Awaiting":0,"Resolved":0,"Closed":94,"Total":94},
      "P08":{"New":0,"In progress":0,"Awaiting":0,"Resolved":0,"Closed":913,"Total":913}},
      "config":{"openedAt":["2014-10-01","2015-01-01"],"categoryExclude":["Failure"]}},
      "target":{"kpis":{
        "P01":{"New":0,"In progress":0,"Awaiting":0,"Resolved":0,"Closed":62,"Total":62},
        "P08":{"New":4,"In progress":16,"Awaiting":9,"Resolved":11,"Closed":716,"Total":756}},
        "config":{"openedAt":["2015-05-01","2015-08-01"],"categoryExclude":["Failure","Request","Misplaced Call"],"businessServiceExclude":["Workplace"]}},
        "trends":[{"prio":"P01","state":"New","trend":0},
                  {"prio":"P01","state":"In progress","trend":0},
                  {"prio":"P01","state":"Awaiting","trend":0},
                  {"prio":"P01","state":"Resolved","trend":0},
                  {"prio":"P01","state":"Closed","trend":"-34.0"},
                  {"prio":"P01","state":"Total","trend":"-34.0"},
                  {"prio":"P08","state":"New","trend":"Infinity"},
                  {"prio":"P08","state":"In progress","trend":"Infinity"},
                  {"prio":"P08","state":"Awaiting","trend":"Infinity"},
                  {"prio":"P08","state":"Resolved","trend":"Infinity"},
                  {"prio":"P08","state":"Closed","trend":"-21.6"},
                  {"prio":"P08","state":"Total","trend":"-17.2"}]}

  */
  console.log("---------------- data: "+JSON.stringify(data));

  var _baseline = data.baseline.kpis;
  var _baselinePeriod = data.baseline.config.openedAt;
  var _target = data.target.kpis;
  var _targetPeriod = data.target.config.openedAt;
  var _trends = data.trends;

  var _targetP01= (_baseline.P01.Total-(_baseline.P01.Total*0.2)).toFixed(0);
  var _targetP08= (_baseline.P08.Total-(_baseline.P08.Total*0.2)).toFixed(0);
  //var _targetP16= (_baseline.P16.Total-(_baseline.P16.Total*0.2)).toFixed(0);

  var _trendP01= _.findWhere(_trends,{"prio":"P01",state:"Total"}).trend+"%";
  var _trendP08= _.findWhere(_trends,{"prio":"P08",state:"Total"}).trend+"%";
  //var _trendP16= _.findWhere(_trends,{"prio":"P16",state:"Total"}).trend+"%";


    $('#k2_baseline').text("Q4-2014");
    $('#k2_baseline_p01').text(_baseline.P01.Total);
    $('#k2_baseline_p08').text(_baseline.P08.Total);

    $('#k2_target').text("Q4-2015");
    $('#k2_target_p01').text(_targetP01);
    $('#k2_target_p08').text(_targetP08);



    $('#k2_current').text("current");
    $('#k2_current_p01').text(_target.P01.Total);
    $('#k2_current_p08').text(_target.P08.Total);

    $('#k2_left').text("left");
    $('#k2_left_p01').text(_targetP01-_target.P01.Total);
    $('#k2_left_p08').text(_targetP08-_target.P08.Total);


    $('#k2_trend').text("trend");
    $('#k2_trend_p01').text(_trendP01);
    $('#k2_trend_p08').text(_trendP08);

    /*
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
    */
});
