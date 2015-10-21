nv.addGraph(function() {
  //var _year = moment().year();
	//var _month = moment().format("MM");
	var traffic=[];
	var _url = window.location.protocol+"//ea.bwinparty.corp/nginxlive/rest/hits/"+_year+"/"+_month;
  console.log("........traffic chart")
  // do a ajax call
  $.get( _url, function( data ) {
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
      .tooltips(true);
    chart.forceY([96,98,100])
    d3.select('#chartTraffic svg')
      .datum(trafficData)
      .transition().duration(500)
      .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
  });
});

nv.addGraph(function() {
  //var _year = moment().year();
	//var _month = moment().format("MM");
	var traffic=[];
	var _url = window.location.protocol+"//ea.bwinparty.corp/nginxlive.php";
  console.log("........traffic distribution")
  // do a ajax call
  $.get( _url, function( data ) {
    console.log("...got data "+JSON.stringify(data));

		var _overall = 0;
		for (var i in data){
			_overall+=data[i].count;
		}
		for (var i in data){
			data[i].percentage=Math.round((data[i].count/_overall)*100);
		}

		$('#locationDistribution').text(" last 24 hour: total hits: "+_overall)
		//console.log("pluck: "+_.pluck(data,"percentage"));

    //var trafficDistributionData = [{key:"location - percentage",values:_.pluck(data,"percentage")}];
    var chart = nv.models.pieChart()
            .x(function(d) { return d._id })
            .y(function(d) { return d.percentage })
            .donut(true)
            .padAngle(.01)
            .cornerRadius(1)
						.showLegend(false)
            .id('donut1'); // allow custom CSS for this one svg
		//chart.tooltip.contentGenerator(function (d) { return Math.round(d)+"%"; })
		        //chart.title("locations");
        chart.pie.donutLabelsOutside(true).donut(true);

    d3.select('#chartTrafficLocation svg')
      .datum(data)
      .transition().duration(500)
      .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
  });
});
