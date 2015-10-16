var chart4;

var _tracker = ["RoR (Q1+Q2)",103];

var _target = ["Target",100];

var _ticks=[""];

_drawChart4(_tracker,_target,_ticks);


function _drawChart4(tracker,target,ticks){
  console.log("--------------------------------- draw chaert4 !!!!!!")
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
              categories: ticks
          },
          y: {
            max: 110,
            min: 80,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
            tick: {

              format: function (d) { return d+'%'; }
            }
        }
    }

  });

}
