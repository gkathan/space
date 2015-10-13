var phantom = require('phantom');

//var _url="http://localhost:3000/dashboard/opsreport";
//var _url="https://sports.m.bwin.com/en/sports";
var _url="http://localhost:3000/kanban/55e5521a7a35dd2f8de26357";

phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any",function (ph) {
  ph.createPage(function (page) {
    //page.set('settings.userAgent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36');
    //page.set('viewportSize', {width:1600,height:2400})

  /*  page.set('paperSize', {
    format: 'A4',
    orientation: 'portrait',
    margin: {
        top: '1cm',
        left: '1,6cm',
        right: '1,6cm',
        bottom: '1cm'
        }
      });

*/
    page.set("onConsoleMessage", function () {
  console.log(arguments);
});

    page.open(_url, function (status) {
        console.log("status:"+status);
      page.evaluate(function (){
        $('#username').val('bwin');
        $('#password').val('bw1N_');
        $('#loginsubmit').click();

        console.log("--------------");
        return document.title;

        }

        , function (result) {
        console.log('Page title is ' + result);

        setTimeout(function() {

        page.set("zoomFactor",0.1);
       //page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
         page.render('test.png', {format: 'png', quality: '100'},function(){
           console.log('Page Rendered');
           ph.exit();
        });
      },3000);
      });
    });
  });
});
