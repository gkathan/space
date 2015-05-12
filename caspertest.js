//var casper = require('casper');

var _url="http://localhost:3000";

casper.test.begin('user simulation end2end testing', 3, function(test) {

  casper.start(_url, function() {
      this.echo(this.getTitle());
  });

  casper.thenOpen(_url+"/admin?type=labels", function() {
      this.echo(this.getTitle());
      test.assertTitle("s p a c e - login");
  });

  casper.thenOpen(_url+"/login", function() {
      this.echo(this.getTitle());
      this.waitForSelector("form input[name='username']", function() {
          this.fillSelectors('form#loginform', {
              'input[name = username ]' : 'admin',
              'input[name = password ]' : '4dm1n',
          });
      }, true);

    casper.then(function () {
           this.evaluate(function () {
            $('#loginsubmit').click();

        });
    test.assertEval(function() {return true;});
    })
  });
  casper.thenOpen(_url+"/admin?type=labels", function() {
      this.echo(this.getTitle());
      test.assertTitle("s p a c e - admin");
  });


  casper.run(function(){
    test.done();
  });
});
