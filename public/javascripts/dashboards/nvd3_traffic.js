nv.addGraph(function() {
  //var _year = moment().year();
	//var _month = moment().format("MM");
	var traffic=[];

	var _url = window.location.protocol+"//ea.bwinparty.corp/nginxlive/rest/hits/"+_year+"/"+_month;

  console.log("........traffic chart")

  // do a ajax call
  $.get( _url, function( data ) {

		//data=JSON.parse(data);
    console.log("...got data "+data.length);
		for (var d in data){
			var _d = data[d];
			if (_d._id.host=="space.bwinparty.corp") traffic.push(_d);
		}
    console.log("traffic data: "+traffic.length);
    var trafficData = [{key:"space.bwinparty.corp - hits",values:traffic}];
    var chart = nv.models.lineChart()
      //.x(function(d) { return moment().date(d._id.date) })
      .x(function(d) {return d._id.day  })
      .y(function(d) { return d.hits })
      .tooltips(true)


;
    chart.forceY([96,98,100])
    d3.select('#chartTraffic svg')
      .datum(trafficData)
      .transition().duration(500)
      .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
  });
});
