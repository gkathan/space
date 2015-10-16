var _url = "/api/space/rest/targetstracker/2015?kpi=K3";
var chart3;

$.get(_url,function(data){
  var _tracker = data;
  var _mobileshare;
  var _target;
  _mobileshare = _.pluck(data,"Mobile Share");
  _target = _.pluck(data,"Target");

  for (var i in _mobileshare){
    _mobileshare[i]=parseFloat(_mobileshare[i]).toFixed(2)*100;
  }
  for (var t in _target){
    _target[t]=parseFloat(_target[t]).toFixed(2)*100;
  }


  _mobileshare.splice(0,0,"Mobile Share")
  _target.splice(0,0,"Target")

  _ticks=_.pluck(data,"Period");

  // only first letter of Month
  for (var i in _ticks){
    _ticks[i]=_ticks[i][0];
  }

  _drawChart3(_mobileshare,_target,_ticks);

})


function _drawChart3(mobileshare,target,ticks){
  console.log("****** C3 spline: "+mobileshare+" - "+ticks);
  chart3 = c3.generate({
      bindto : '#c3_mobile_spline',
      size: {
        height:200,
        width:190
      },
      data: {
          columns: [
              mobileshare,
              target

          ],
          type: 'line',
          types:{
            "Mobile Share":'area-spline'
          }
      },

      axis: {
        x: {
            type: 'category',
            categories: ticks
        },
         y: {
            max: 50,
            min: 20,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
            tick: {

              format: function (d) { return d+'%'; }
            }
        }
    }

  });

}
