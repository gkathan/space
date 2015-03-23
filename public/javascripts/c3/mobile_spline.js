

var chart3 = c3.generate({
    bindto : '#c3_mobile_spline',
    size: {
      height:180,
      width:190
    },
    data: {
        columns: [
            ['data1', 30, 200, 100, 300, 150, 250],
            ['data2', 50, 150, 90, 250, 120, 250],
        ],
        type: 'area-spline'
    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
    }
});
