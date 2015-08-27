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


var SPACE_API = CONFIG.api.protocol+"://"+CONFIG.api.host+"/api/space/rest/"


var TRANSCODE_URL = CONFIG.transcoder.url;
var KANBANV2API_URL = CONFIG.api.url;

var V1_PROD_URL = CONFIG.v1.url;
var V1_DATA_URL = CONFIG.v1.proxy;


var FQ_DELIMITER="/";


function dataSourceFor(collection){
	return SPACE_API+collection;
}




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

						{"context":"studios", "name":"Casino","value"	:25},
						{"context":"studios","name":"Payments","value"	:10},
						{"context":"studios","name":"Poker","value"	:20},
						{"context":"studios","name":"Sports Content, Trading & security","value"	:5},
						{"context":"studios","name":"CRM Services","value"	:5},
						{"context":"studios","name":"Sports","value"	:10},
						{"context":"studios","name":"Core Services","value"	:10},
						{"context":"studios","name":"Studios","value"	:5},
						{"context":"studios","name":"Portal","value"		:5},
						{"context":"studios","name":"Compliance","value"		:5}

					]
			},
			{"level":"2","mode": "auto","percentages":

					[
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
