
function redirect(location){
	window.location.href=location;
}

/**
 * retrieves the AUTH role
 */
 function getAUTH(){
	 return sessionStorage.getItem("AUTH");
 }

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}



// ********************* ajax helpers **********************************


/**
* helper class for ajax calls
*  verb: "POST", "DELETE",...
*  action = what to do
* _type = type of object (e.g. initiatives)
*
* referenced from admin.php
*/
function ajaxCall(verb,action,itemList,_type,afterHandlerCallback){

		console.log("++ verb: "+verb);
		console.log("++ action: "+action);
		console.log("++ _type: "+_type);


		var _json = JSON.stringify(itemList);

		console.log("JSON.stringify tha shit..."+_json);

		// and send to backend ! :-)
		$.ajax({
		type: verb,
		url: dataSourceFor(_type),
		data: { 'itemJson': _json, 'action':action },
		cache: false,
		dataType:"json",
		success: function(msg)
			{
				console.log("==== success handler...");
				if (afterHandlerCallback !=undefined) afterHandlerCallback(_type);
				var _items="";
				for (var i in itemList){
					_items+=itemList[i].name;
					//console.log("*****i: "+i+" - "+itemList[i].name);
					if (i< itemList.length-1) _items+=", "
				}

				console.log("==== and now lets notify...");
				$('.top-left').notify({
						message: { html: "<span class=\"glyphicon glyphicon-ok\"></span><span style=\"font-size:10px;font-weight:bold\"> ajaxCall.("+action+") says:</span> <br/><div style=\"font-size:10px;font-weight:normal;margin-left:20px\">* "+action+": "+_type+": [SUCCESS]  </div>" },
						fadeOut: {enabled:true,delay:3000},
						type: "success"
					  }).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.


			},
		error: function(msg)
			{
				if (afterHandlerCallback !=undefined)
				$('.top-left').notify({
						message: { html: "<span class=\"glyphicon glyphicon-fire\"></span><span style=\"font-size:10px;font-weight:bold\"> ajaxCall.("+action+") says:</span> <br/><div style=\"font-size:10px;font-weight:normal;margin-left:20px\">* synced item [_id:"+itemList[0]._id+"] #failed<br>"+JSON.stringify(msg)+"</div>" },
						fadeOut: {enabled:false},
						type: "danger"
					  }).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.


			}
		});

}
