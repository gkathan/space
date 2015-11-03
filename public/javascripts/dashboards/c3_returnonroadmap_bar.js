var chart4;
var _url = "/api/space/rest/targetstracker?period=2015&kpi=K4";
var _tracker;
var _target;

var _ticks=["test","test"];
$.get(_url,function(data){
  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX data: "+JSON.stringify(data));
  var _current = _.last(_.sortByOrder(data,"lastUpdate","desc"));
  _tracker = ["RoR "+_current.scope,_current.RoR];
  _target = ["Target",_current.target]
  $("#lastUpdate_K4").text(moment(_current.lastUpdate).format('YYYY-MM-DD'));
  _drawChart4(_tracker,_target,parseInt(_current.minRange),_ticks);
});

function _drawChart4(tracker,target,minRange,ticks){
  chart4 = c3.generate({
      bindto : '#c3_returnonroadmap_bar',
      size: {
        height:200,
        width:190
      },
      data: {
          columns: [
              tracker,
              target
          ],
          type: 'bar',
          types:{
            "return on roadmap":'bar'
          }
      },
      axis: {
          x: {
              type: 'category',
              categories: ["RoR"]
          },
          y: {
            max: parseInt(tracker[1]),
            min: minRange,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
            tick: {
              format: function (d) { return d+'%'; }
            }
        }
    }
  });

}
