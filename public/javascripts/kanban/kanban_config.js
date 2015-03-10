/** NG version (2.0) based on node.js express and new data structures 
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.github.com/gkathan/kanban
 */


var CONFIG_URL = "/api/space/config";


var CONFIG=loadConfig();



var host = window.location.host;


var TRANSCODE_URL = CONFIG.transcoder.url;
var KANBANV2API_URL = CONFIG.api.url;

var V1_PROD_URL = CONFIG.v1.url;

var V1_DATA_URL = CONFIG.v1.proxy;

//var V1_DATA_URL = "/v1nodegateway/v1epics";
//var V1_DATA_URL = "data/json/epics.json";

var DS = CONFIG.database.type;//"MONGO";
//var DS ="MYSQL";

	



/*
if (host=="kanbanv2.ea.bwinparty.corp") {
	KANBANV2API_URL = '/api/kanbanv2/rest/';
	TRANSCODE_URL = "http://tomcat.ea.bwinparty.corp/transcode/";
}
else if (host.split(":")[0]=="localhost"){
	KANBANV2API_URL = '/api/kanbanv2/rest/';
	TRANSCODE_URL = "/api/kanbanv2/transcode/";
}

*/
var JSON_CONFIG =
				[
					{type:"mongo",url:KANBANV2API_URL},
					{type:"mysql",url:"/data/data.php?type="},
				];


var COLOR_BPTY="#174D75";
// hsl(206,67%,27%)

var COLOR_PRIMARY = "#174D75";

var COLOR_PRIMARY2 = "#00b8e4";
var COLOR_SECONDARY = "#82cec1";
var COLOR_SECONDARY2 = "#f99d1c";
var COLOR_SECONDARY3 = "#b0acd5";
var COLOR_SECONDARY4 = "#ffcd03";



/*
#00b8e4 türkis
hsl(192,100%,45%)

#f99d1c orange
hsl(35,95%,54%)

#82cec1 lind
hsl(170,44%,66%)

#ffcd03 yellow
hsl(48,100%,51%)

#b0acd5 pink 
hsl(246,33%,75%)
*/
// http://highintegritydesign.com/tools/tinter-shader/

// 174D75 00b8e4 f99d1c 82cec1 ffcd03 b0acd5
var FQ_DELIMITER="/";


function dataSourceFor(collection){
	for (var p in JSON_CONFIG){
		if (JSON_CONFIG[p].type==DS) return JSON_CONFIG[p].url+collection; 
	}
}


//overrides for lanes 
var itemDataConfig = [	
			{"level":"0", "mode": "auto","percentages":
					[
						{"context":"holding","name":"b2c gaming","value"	:80},
						{"context":"holding","name":"new biz","value"		:20}
						
					]
			},
			{"level":"1", "mode": "auto","percentages":
					[
						{"context":"b2c gaming", "name":"topline","value"	:60},
						{"context":"b2c gaming","name":"enabling","value"	:40},
						{"context":"studios", "name":"customer","value"	:50},
						{"context":"studios","name":"product","value"	:20},
						{"context":"studios","name":"enabling","value"		:30}						
					]
			},
			{"level":"2","mode": "auto","percentages":
					
					[
						{"context":"studios","name":"bwin","value"		:20},
						{"context":"studios","name":"premium","value"		:15},
						{"context":"studios","name":"pp","value"		:15},
						{"context":"studios","name":"danske","value"		:10},
						{"context":"studios","name":"pmu","value"		:10},
						{"context":"studios","name":"borgata","value"		:10},
						{"context":"studios","name":"bwinfeed","value"		:10},
						{"context":"studios","name":"betfred","value"		:10},
						
						{"context":"holding","name":"bwin","value"		:30},
						{"context":"holding","name":"studios","value"		:20},
						{"context":"holding","name":"premium","value"		:10},
						{"context":"holding","name":"kalixa","value"		:10},
						{"context":"holding","name":"conspo","value"		:5},
						{"context":"holding","name":"wincom","value"		:5},
						{"context":"holding","name":"CS","value"		:10},
						{"context":"holding","name":"bpty","value"		:5},
						{"context":"holding","name":"bwinfeed","value"		:5}
						
						
					]
						
			},
			// selective override only for one sublane works too ;-)
			{"level":"3","mode":"equal","percentages":
					[
						{"context":"*","name":"bwin"+FQ_DELIMITER+"touch","value"	:30},
						{"context":"*","name":"bwin"+FQ_DELIMITER+"click","value"	:10},
						{"context":"*","name":"bwin"+FQ_DELIMITER+"market","value"	:20},
						{"context":"*","name":"bwin"+FQ_DELIMITER+"product","value"	:20},
						{"context":"*","name":"bwin"+FQ_DELIMITER+"enabling","value":20}
					]
			}
	];		


/** retrieves the serverside config via ajax call
 */
function loadConfig(){
	
	 var config;
	 
        $.ajax({
         async: false,
         dataType : 'json',
         url: CONFIG_URL,
         type : 'GET',
         success: function(data) {
			return config = data;
         }
      });

     return config;
	
}


/** tests all needed connections
 */
function checkServices(){
		var check = $.get( KANBANV2API_URL+"targets", function() {
	  console.log("[DEBUG] checkServices()....");
	})
	  .done(function() {
		console.log( " success" );
	  })
	  .fail(function() {
		 $('.top-left').notify({
				message: { html: "<span class=\"glyphicon glyphicon-fire\"></span><span style=\"font-size:10px;font-weight:bold\"> kanban.checkServices() says:</span> <br/><div style=\"font-size:10px;font-weight:normal;margin-left:20px\">* nodeJS datagateway ("+MONGO_GATEWAY_URL+") offline...<br>* please contact <a href=\"mailto:gerold.kathan@bwinparty.com?Subject=[kanban issue]#nodeJS datagateway offline\" target=\"_top\">[your corpkanban support team]</a> for assistance</div>" },
				fadeOut: {enabled:false},
				type: "danger"
			  }).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
				  });
}

function initShortcuts(){
	Mousetrap.bind(['v'], function(e) {
		console.log("redirect to v1sync");
		window.location.href="v1sync.php";
		return false;
	});

	Mousetrap.bind(['a i'], function(e) {
		console.log("redirect to admin initiatives");
		window.location.href="admin.php?type=initiatives";
		return false;
	});

	Mousetrap.bind(['a t'], function(e) {
		console.log("redirect to admin targets");
		window.location.href="admin.php?type=targets";
		return false;
	});

	Mousetrap.bind(['a m'], function(e) {
		console.log("redirect to admin metrics");
		window.location.href="admin.php?type=metrics";
		return false;
	});
	
		Mousetrap.bind(['a l'], function(e) {
		console.log("redirect to admin lanetext");
		window.location.href="admin.php?type=lanetext";
		return false;
	});



	Mousetrap.bind(['k'], function(e) {
		console.log("redirect to kanban");
		window.location.href="kanban.php";
		return false;
	});
	

	Mousetrap.bind(['m'], function(e) {
		console.log("open menus");
		$('#kanban_menu').trigger('click');
		return false;
	});
	
	Mousetrap.bind(['e p'], function(e) {
		console.log("export pdf");
		$('#save_as_pdf').trigger('click');
		return false;
	});
	
	Mousetrap.bind(['e g'], function(e) {
		console.log("export png");
		$('#save_as_png').trigger('click');
		return false;
	});

}

