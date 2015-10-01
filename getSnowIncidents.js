var url = "https://bwinparty.service-now.com/incident_list.do?JSONv2&sysparm_action=getRecords&sysparm_query=priority<=1";
//var url = "http://knbnprxy.ea.bwinparty.corp/rest/backlogs"
//var url = "http://localhost:3000/api/space/rest/incidentskpis"

var _proxy = {
//            host:"atvt1xismt002.apz.unix", // proxy host
//            port:3128, // proxy port
//            tunnel:false
        };

var fetch = require('node-fetch');
fetch(url)
    .then(function(res) {
        console.log("----"+JSON.stringify(res.json()));
         return res.json();
    }).then(function(json) {
      console.log("----xxxx");
        console.log("...."+json);
    });

// json


/*
var Client = require('node-rest-client').Client
client = new Client({user:"dashboard_studio_intg",password:"dashboard_studio_intg_2015"});


	console.log("*** [_getSnowData] client.get data : url = "+url);
	client.get(url, function(data, response,done){
		console.log("data: "+data);
    //var _incidents=JSON.parse(data);
	}).on('error',function(err){
      console.log("error: "+err.message);
  });
*/
