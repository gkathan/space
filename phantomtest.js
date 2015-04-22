var phantom = require('phantom');

var _url="https://apm.bwinparty.corp/controller/rest/applications/bwin.party/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7Cbetting.api.bwin.be/v2%7CBettingPosBE-BetPlacementService.PlaceBet%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=1427839200000&end-time=1427925600000&output=JSON";


phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.open(_url, function (status) {
      page.evaluate(function () { return document.title; }, function (result) {
        console.log('Page title is ' + result);
        ph.exit();
      });
    });
  });
});
