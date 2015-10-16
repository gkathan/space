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




    var _baselineString = "<br><span style='font-weight:normal;font-size:9px'>baseline: "+_baselinePeriod+"</span><br><img src='/images/incidents/P01.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_baseline.P01.Total+"</b> <img src='/images/incidents/P08.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_baseline.P08.Total+"</b>";
    // <img src='/images/incidents/P16.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_baseline.P16.Total+"</b>";
    $('#baseline').html(_baselineString);



    var _targetString = "<span style='font-weight:normal;font-size:9px'>target: "+_targetPeriod+"</span><br><img src='/images/incidents/P01.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_target.P01.Total+"</b> <img src='/images/incidents/P08.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_target.P08.Total+"</b>";
    //  <img src='/images/incidents/P16.png' height='20px' style='padding-left:2px;padding-right:2px'><b style='font-size:12px'>"+_target.P16.Total+"</b>";

    _targetString+="<br><span style='font-weight:normal;font-size:9px'>trending</span><br><img src='/images/incidents/P01.png' height='15px' style='padding-left:2px;padding-right:2px'> <b  style='font-size:10px'>"+_.findWhere(_trends,{"prio":"P01",state:"Total"}).trend+"%</b> <img src='/images/incidents/P08.png' height='15px' style='padding-left:2px;padding-right:2px'> <b  style='font-size:10px'>"+_.findWhere(_trends,{"prio":"P08",state:"Total"}).trend+"%</b>";
    // <img src='/images/incidents/P16.png' height='15px' style='padding-left:2px;padding-right:2px'> <b style='font-size:10px'>"+_.findWhere(_trends,{"prio":"P16",state:"Total"}).trend+"%</b>";




    $('#target').html(_targetString);

    var _targetP01= (_baseline.P01.Total-(_baseline.P01.Total*0.2)).toFixed(0);
    var _targetP08= (_baseline.P08.Total-(_baseline.P08.Total*0.2)).toFixed(0);
    //var _targetP16= (_baseline.P16.Total-(_baseline.P16.Total*0.2)).toFixed(0);

    $('#targetIncidentAbsolut').html("P01 < "+_targetP01+" P08 < "+_targetP08);

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
