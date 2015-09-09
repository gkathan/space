//var url = "https://bwinparty.service-now.com/incident_list.do?JSONv2&sysparm_action=getRecords&sysparm_query=priority<=2^active=true";
var url = "https://bwinparty.service-now.com/problem_list.do?JSONv2&sysparm_action=getRecords&sysparm_query="

var _proxy = {
            host:"atvt1xismt002.apz.unix", // proxy host
            port:3128, // proxy port
            tunnel:true
        };


var Client = require('node-rest-client').Client
client = new Client({proxy:_proxy,user:"dashboard_studio_intg",password:"dashboard_studio_intg_2015"});


	console.log("*** [_getSnowData] client.get data : url = "+url);
	client.get(url, function(data, response,done){
		console.log("incident data: "+JSON.stringify(data));
	}).on('error',function(err){
      console.log("error: "+err.message);
  });
