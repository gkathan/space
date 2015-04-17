var availability;//={unplannedYTD:99.61,targetYTD:99.75};

// do a ajax call
$.get( "/api/space/rest/availability", function( data ) {
  console.log("ajax call to get av data: "+JSON.stringify(data));
  var av = data[0].avReport.getYTDDatapoint;

  // do another ajax call to get target values
  $.get( "/api/space/rest/targets/L1", function( l1targets ) {
    console.log("ajax call to get L1target data: "+JSON.stringify(l1targets));
    var _s1 = _.findWhere(l1targets,{id:'K1'});

    //availability={unplannedYTD:99.61,targetYTD:99.75};
    availability={unplannedYTD:av.unplanned,targetYTD:_s1.directMetric};
    console.log("===================== "+JSON.stringify(av));

    console.log("===================== "+JSON.stringify(availability));


    var chart1 = c3.generate({
        bindto : '#c3_availability_gauge',
        data: {
            columns: [
                ['data', availability.unplannedYTD]
            ],
            type: 'gauge',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        },
        gauge: {
            label: {
                format: function(value, ratio) {
                    return value;
                },
                show: true // to turn off the min/max labels.
            },
        min: 99, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
        max: 99.9, // 100 is default
        units: '%',
        width: 39 // for adjusting arc thickness
        },
        color: {
            pattern: ['red', 'gold', 'limegreen'], // the three color levels for the percentage values.
            threshold: {
    //            unit: 'value', // percentage is default
    //            max: 200, // 100 is default
                values: [99.60,  _s1.directMetric,99.99]
            }
        },
        size: {
            height: 110
        }
    });

    setTimeout(function () {
        chart1.load({
            columns: [['data', 99.30]]
        });
    }, 300);

    setTimeout(function () {
        chart1.load({
            columns: [['data', 99.50]]
        });
    }, 600);

    setTimeout(function () {
        chart1.load({
            columns: [['data', 99.90]]
        });
    }, 900);

    setTimeout(function () {
        chart1.load({
            columns: [['data', 99.40]]
        });
    }, 1200);

    setTimeout(function () {
        chart1.load({
            columns: [['data', availability.unplannedYTD]]
        });
    }, 1500);

  });
});
