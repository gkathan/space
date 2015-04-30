/***
 * Contains basic SlickGrid formatters.
 *
 * NOTE:  These are merely examples.  You will most likely need to implement something more
 *        robust/extensible/localizable/etc. for your use!
 *
 * @module Formatters
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Formatters": {
        "PercentComplete": PercentCompleteFormatter,
        "PercentCompleteBar": PercentCompleteBarFormatter,
        "YesNo": YesNoFormatter,
        "Checkmark": CheckmarkFormatter,
        "SimpleDate": SimpleDateFormatter,
        "RAG":RAGFormatter,
        "V1EpicURL":V1EpicURLFormatter,
        "SnowIncidentURL":SnowIncidentURLFormatter,
        "CheckInSync":CheckInSyncFormatter,
        "IncidentSLABreach":IncidentSLABreachFormatter,
        "IncidentState":IncidentStateFormatter,
        "IncidentPriority":IncidentPriorityFormatter,
        "ResolutionTime":ResolutionTimeFormatter
      }
    }
  });

  function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "-";
    } else if (value < 50) {
      return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
    } else {
      return "<span style='color:green'>" + value + "%</span>";
    }
  }

  function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "";
    }

    var color;

    if (value < 30) {
      color = "red";
    } else if (value < 70) {
      color = "silver";
    } else {
      color = "green";
    }

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
  }

  function YesNoFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "Yes" : "No";
  }



  function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "<img src='../images/tick.png'>" : "";
  }

  /**
   * extension by cactus
   */
  function SimpleDateFormatter(row, cell, value, columnDef, dataContext) {
    return value ? d3.time.format("%Y-%m-%d")(new Date(value)) : "";
  }


  /** version1 - epic URL
   **/
   http://v1.bwinparty.corp/V1-Production/Epic.mvc/Summary?oidToken=Epic%3A3394319
  function V1EpicURLFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "<a href=\"http://v1.bwinparty.corp/V1-Production/Epic.mvc/Summary?oidToken=Epic%3A"+value+"\" target=\"_new\">"+value+"</a>" : "";
  }

  /* snow deeplink incident formatter
  */
  function SnowIncidentURLFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "<a href=\"https://bwinparty.service-now.com/ess/incident.do?sys_id="+value+"\" target=\"_new\">"+value+"</a>" : "";
  }


  /** employee profile
   * https://my.bwinparty.com/People/S/MassimilianoScorzaE5148.aspx
   * firstname
   * lastname
   * number
   * => calculate first char from lastname
   *
   **/
   http://v1.bwinparty.corp/V1-Production/Epic.mvc/Summary?oidToken=Epic%3A3394319
  function EmployeeProfileURLFormatter(row, cell, value, columnDef, dataContext) {

    return value ? "<a href=\"https://my.bwinparty.com/People/F/fuckingBla+Number+.aspx target=\"_new\">"+value+"</a>" : "";
  }




  function RAGFormatter(row, cell, value, columnDef, dataContext) {
    var _color;
    if (value){
  		if (value.toLowerCase()=="red") _color="red";
  		if (value.toLowerCase()=="amber") _color="gold";
  		if (value.toLowerCase()=="green") _color="limegreen";
	  }

    return value ? "<div style='text-align:center'><div style='display:inline-block;margin-top:2px;width:10px;height:10px;-moz-border-radius: 50%; -webkit-border-radius: 50%; border-radius: 50%;background-color:"+_color+"''></div></div>" : "";
  }

  function CheckInSyncFormatter(row, cell, value, columnDef, dataContext) {
    if (value==0) return "<img src='../images/iconexp/bullet_ball_yellow.png'>"
    if (value==1) return "<img src='../images/iconexp/bullet_ball_green.png'>"
    return "<img src='../images/iconexp/bullet_ball_grey.png'>"
  }


  function IncidentSLABreachFormatter(row, cell, value, columnDef, dataContext) {
    var _color;
    if (value){
  		if (value == true) _color="red";
  		if (value==false) _color="limegreen";
	  }

    return value ? "<div style='text-align:center'><div style='display:inline-block;margin-top:2px;width:10px;height:10px;-moz-border-radius: 50%; -webkit-border-radius: 50%; border-radius: 50%;background-color:"+_color+"''></div></div>" : "";
  }

  function IncidentStateFormatter(row, cell, value, columnDef, dataContext) {
    var _color;
    if (value){
      if (value == "Resolved") _color="limegreen";
      if (value=="In progress") _color="gold";
      if (value=="New") _color="red";
      if (value=="Awaiting") _color="steelblue";
      if (value=="Closed") _color="lightgrey";
    }

    return value ? "<div style='text-align:center'><div style='display:inline-block;margin-top:2px;width:10px;height:10px;-moz-border-radius: 50%; -webkit-border-radius: 50%; border-radius: 50%;background-color:"+_color+"''></div></div>" : "";
  }

function IncidentPriorityFormatter(row, cell, value, columnDef, dataContext) {
  var _color;
  if (value){
    if (value == "P01 - Critical") _style="font-weight:bold;color:black";
    if (value=="P08 - High") _style="font-weight:normal;color:black";
    if (value=="P16 - Moderate") _style="font-weight:normal;color:grey";
    if (value=="P40 - Low") _style="font-weight:normal;color:lightgrey";
  }

  return "<span style='"+_style+"'>"+value+"</span>";
}

  function ResolutionTimeFormatter(row, cell, value, columnDef, dataContext) {

    	//var ms = moment(_resolved,"DD/MM/YYYY HH:mm:ss").diff(moment(_open,"DD/MM/YYYY HH:mm:ss"));
  		var d = moment.duration(value);
  		var _time;
      // longer than a day
      if (d>=86400000){
       _time = d.format("d[d] h:mm:ss", { trim: false });
      }
      else{
        _time = d.format("h:mm:ss", { trim: false });
      }

    return _time;
  }



})(jQuery);
