var availability;//={unplannedYTD:99.61,targetYTD:99.75};

// do a ajax call
$.get( "/api/space/rest/availability", function( data ) {
  //console.log("ajax call to get av data: "+JSON.stringify(data));
  var av = data[0].avReport.getYTDDatapoint;

  // do another ajax call to get target values
  $.get( "/api/space/rest/targets/L1?period=2015", function( l1targets ) {
    //console.log("ajax call to get L1target data: "+JSON.stringify(l1targets));
    var _s1 = _.findWhere(l1targets,{id:'K1'});

    //availability={unplannedYTD:99.61,targetYTD:99.75};
    availability={unplannedYTD:av.unplanned,targetYTD:_s1.directMetric};
    console.log("===================== "+JSON.stringify(av));

    console.log("===================== "+JSON.stringify(availability));

    var _targetAV = parseFloat(_s1.directMetric);
    var _currentAV = parseFloat(availability.unplannedYTD);

    var _targetdowntimems = _getTimeForAVPercentage(_targetAV,{value:1,type:"year"});
    var _spentdowntimems = _getTimeForAVPercentage(_currentAV,{value:moment().dayOfYear(),type:"days"});



    var _leftdowntimems = _targetdowntimems-_spentdowntimems;

    var _projectedAV = _getAVPercentageforDowntime(_spentdowntimems,{value:1,type:"year"});

    var _targetdowntime = moment.duration(_targetdowntimems).format('HH:mm.ss');
    var _leftdowntime =  moment.duration(_leftdowntimems).format('HH:mm.ss',{trim: false});
    var _spentdowntime =  moment.duration(_spentdowntimems).format('HH:mm.ss',{trim: false});

    console.log("--------------av projected: "+_projectedAV);
    $('#targetdowntime').text(_targetdowntime);
    $('#leftdowntime').text(_leftdowntime);
    $('#spentdowntime').text(_spentdowntime);
    $('#trendAV').text(_projectedAV+"%");



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
                values: [99.70,  _s1.directMetric,99.99]
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


function _getTimeForAVPercentage(percentage,period){
	//ms

	var _totalTime = moment.duration(period.value,period.type);



  var _offtime = (1-(percentage/100))*_totalTime;

  console.log("_getTimeForAVPercentage: percentage= "+percentage+ "period: "+JSON.stringify(period)+" offtime: "+_offtime);


  return _offtime;
}

function _getAVPercentageforDowntime(downtime,period){
	//ms
	var _totalTime = moment.duration(period.value,period.type);
	var _avpercentage = parseFloat((1-(downtime/_totalTime))*100).toFixed(2);
	return _avpercentage;
}
