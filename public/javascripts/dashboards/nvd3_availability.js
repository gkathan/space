nv.addGraph(function() {



  var availability;//={unplannedYTD:99.61,targetYTD:99.75};

  // do a ajax call
  $.get( "/api/space/rest/availability", function( data ) {
    availability = data[0].avReport.GetAVGraphDatapoints;

    var avData = [{key:"Avalability bla",values:availability}];


      var myColors = ["#174D75","#174D75","#174D75","#2E5F83","#457191","#5C839F","#7395AD","#8AA7BB","#A1B9C9","#B8CBD7","#CFDDE5","#E6EFF3"].reverse();
      d3.scale.myColors = function() {
          return d3.scale.ordinal().range(myColors);
      };

      var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.date })
        .y(function(d) { return d.value.planned })
        .staggerLabels(true)
        .tooltips(true)
        .showValues(true)
        .color(d3.scale.myColors().range())
        
        ;

        chart.forceY([96,98,100])

      d3.select('#chart svg')
        .datum(avData)
        .transition().duration(500)
        .call(chart)
        ;

      nv.utils.windowResize(chart.update);

      return chart;

  });



});
