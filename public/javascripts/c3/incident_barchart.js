var incidents;//={unplannedYTD:99.61,targetYTD:99.75};

// do a ajax call
$.get( "/api/space/rest/incidenttracker/Q1-2014", function( data ) {
  //var inc = JSON.parse(data[0]);

  var weeks =[];
  var w =0;
  var _p1_week=0;
  var _p8_week=0;

  for (var i in data){
    data[i].P1 = parseInt(data[i].P1);
    data[i].P8 = parseInt(data[i].P8);
    _p1_week+=data[i].P1;
    _p8_week+=data[i].P8;

    if (i % 7 ==0){
      console.log("mod 7 ==0 i:"+i);
      weeks[w] = {P1:_p1_week,P8:_p8_week};
      _p1_week=0;
      _p8_week=0;
      w++;
    }
  }

console.log("ajax call to get incidenttracker data: "+JSON.stringify(data));


console.log("weekly aggregation: "+JSON.stringify(weeks));


  var chart2 = c3.generate({
      bindto : '#c3_incident_barchart',
      size: {
        height:180,
        width:190
      },
      data: {
          json: weeks,
          keys: {
              value: ['P1','P8']
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
