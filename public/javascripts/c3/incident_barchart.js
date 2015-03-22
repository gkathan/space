

var chart = c3.generate({
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
    chart.load({
        columns: [
            ['data3', 130, 150, 200, 300, 200, 100]
        ]
    });
}, 1000);
