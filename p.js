var webPage = require('webpage');
var page = webPage.create();

page.open('http://space.bwinparty.corp', function(status) {
  console.log('Status: ' + status);
  // Do other things here...
});
