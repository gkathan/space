	var _secret = require("./config/secret.json");

  var url = "https://apm.bwinparty.corp/controller/rest/applications/bwin.party/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7Cbetting.api.bwin.be/v2%7CBettingPosBE-BetPlacementService.PlaceBet%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=1427839200000&end-time=1427925600000&output=JSON";
  //var url ="https://space.bwinparty.corp/api/space/rest/incidenttracker";

  //var url ="http://localhost:3000/api/space/rest/incidenttracker";
  //var url = "https://v1.bwinparty.corp/V1-Production/";

  var options_auth={user:_secret.apmUser,password:_secret.apmPassword,  connection:{rejectUnauthorized : false}};
  console.log("user: "+_secret.apmUser);
  console.log("password: "+_secret.apmPassword);



  var Client = require('node-rest-client').Client;
  client = new Client(options_auth);

  client.get(url, function(data, response,callback){
    // parsed response body as js object
    console.log("...data:"+JSON.stringify(data));


  }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
            console.log("err: "+err.message)
        });;
