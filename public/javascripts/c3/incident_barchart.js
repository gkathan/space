

var chart2 = c3.generate({
    bindto : '#c3_incident_barchart',
    size: {
      height:180,
      width:190
    },
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
        ],
        type: 'bar'
    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
    }
});


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
