
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
function ajaxCall(verb,action,itemList,_type,_period,afterHandlerCallback){
	var _url = dataSourceFor(_type);
	if (_period){
		_url+="?period="+_period;
	}
		console.log("++ verb: "+verb);
		console.log("++ action: "+action);
		console.log("++ _type: "+_type);
		console.log("++ _url: "+_url);
		var _json = JSON.stringify(itemList);


		console.log("JSON.stringify tha shit..."+_json);

		// and send to backend ! :-)
		$.ajax({
		type: verb,
		url: _url,
		data: { 'itemJson': _json, 'action':action },
		cache: false,
		dataType:"json",
		success: function(msg)
			{
				console.log("[space_utils.ajaxCall] ==== success handler...");
				if (afterHandlerCallback !=undefined) afterHandlerCallback(null,msg);
				console.log("==== and now lets notify...");

				$(function(){
					PNotify.desktop.permission();
					new PNotify({
						title: "SAVE successful",
						text: "[OK] ... "+itemList.length+ " item(s) of type ["+_type+"] saved: "+_json,
						type: "success",
						desktop:  {
							desktop: true,
							icon:"/images/icons/msg_success.png"
						}
					});
				});
			},
		error: function(msg)
			{
				console.log("[space_utils.ajaxCall] ==== error handler..."+msg);
				if (afterHandlerCallback !=undefined) afterHandlerCallback("error occured: "+msg);

				$(function(){
					PNotify.desktop.permission();
					new PNotify({
						title: "SAVE failed !",
						text: JSON.stringify(msg),
						type: "error",
						desktop:  {
							desktop: true,
							icon:"/images/icons/msg_error.png"
						}
					});
				});
			}
		});

}
