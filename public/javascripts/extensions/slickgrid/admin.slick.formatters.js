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
        "CheckInSync":CheckInSyncFormatter

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
    //return value ? "<div style=\"background-color:"+_color+"\">&nbsp;&nbsp;&nbsp;</div>" : "";


    return value ? "<div style='text-align:center'><div style='display:inline-block;margin-top:2px;width:10px;height:10px;-moz-border-radius: 50%; -webkit-border-radius: 50%; border-radius: 50%;background-color:"+_color+"''></div></div>" : "";
  }

  function CheckInSyncFormatter(row, cell, value, columnDef, dataContext) {
    if (value==0) return "<img src='../images/iconexp/bullet_ball_yellow.png'>"
    if (value==1) return "<img src='../images/iconexp/bullet_ball_green.png'>"
    return "<img src='../images/iconexp/bullet_ball_grey.png'>"


  }

})(jQuery);
