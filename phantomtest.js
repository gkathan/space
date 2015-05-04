var phantom = require('phantom');

var _url="http://localhost:3000/dashboard/firereport";


phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.set('settings.userAgent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36');
    //page.set('viewportSize', {width:1600,height:2400})

    page.set('paperSize', {
    format: 'A4',
    orientation: 'portrait',
    margin: {
        top: '1cm',
        left: '1,6cm',
        right: '1,6cm',
        bottom: '1cm'
        }
      });


    page.open(_url, function (status) {

      page.evaluate(function () {
        $('#username').val('admin');
        $('#password').val('4dm1n');
        $('#loginsubmit').click();


        return document.title;

        }

        , function (result) {
        console.log('Page title is ' + result);

        setTimeout(function() {

       //page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
         page.render('firereport.pdf', {format: 'pdf', quality: '100',viewportSize:{width:1600,height:1000}},function(){
           console.log('Page Rendered');
           ph.exit();
        });
      },2000);
      });
    });
  });
});
