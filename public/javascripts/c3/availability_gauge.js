var availability={unplannedYTD:99.61,targetYTD:99.75};

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
                return value+" YTD";
            },
            show: true // to turn off the min/max labels.
        },
    min: 99, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
    max: 99.99, // 100 is default
    units: ' %',
    width: 39 // for adjusting arc thickness
    },
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
        threshold: {
//            unit: 'value', // percentage is default
//            max: 200, // 100 is default
            values: [99.60, 99.70, 99.75, 99.99]
        }
    },
    size: {
        height: 130
    }
});

setTimeout(function () {
    chart1.load({
        columns: [['data', 99.30]]
    });
}, 500);

setTimeout(function () {
    chart1.load({
        columns: [['data', 99.50]]
    });
}, 1000);

setTimeout(function () {
    chart1.load({
        columns: [['data', 99.90]]
    });
}, 1500);

setTimeout(function () {
    chart1.load({
        columns: [['data', 99.40]]
    });
}, 2000);

setTimeout(function () {
    chart1.load({
        columns: [['data', availability.unplannedYTD]]
    });
}, 2500);
