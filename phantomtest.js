console.log("**");

var phantom = require('phantom');

console.log("require through **");
phantom.create(function (ph) {
  console.log("phantom create through **");
  ph.createPage(function (page) {
    console.log("phantom createPage through **"+page);
    page.open("http:/space.bwinparty.corp", function (status) {
      console.log("opened space? ", status);
      page.evaluate(function () { return document.title; }, function (result) {
        console.log('Page title is ' + result);
        ph.exit();
      });
    });
  });
});
