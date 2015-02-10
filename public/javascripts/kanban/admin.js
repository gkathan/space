  function requiredFieldValidator(value) {
    if (value == null || value == undefined || !value.length) {
      return {valid: false, msg: "This is a required field"};
    } else {
      return {valid: true, msg: null};
    }
  }


/*
var initiativeData;
var targetData;
var metricData;
var lanetextData;
var teamData;
var boardData;
var v1epicData;
*/

var adminData;

var _excelExportURL = '/api/kanbanv2/export/xlsx/';
//var _excelExportURL = MONGO_GATEWAY_URL+"excel/";



var admingrid;
  
  var columnFilters={};
  
  
  var _type=getUrlVars()["type"];
  var _filter=getUrlVars()["filter"];
  var _id =getUrlVars()["_id"];
  
  
  //set link for excel download
  document.getElementById("lexcel").href=_excelExportURL+_type;
  $("#admintype").text(_type);
  
  
  
	//checkServices();
	initShortcuts();
	refresh(_type);




function refresh(collection){
	console.log("*****collection="+collection);
	
		$.ajax({
		type: "GET",
		url: dataSourceFor(collection),
		cache: true,
		success: function(msg)
			{
				//console.log("==== success handler..."+JSON.stringify(msg));
				if (collection=="v1epics"){
					// console.log("==== success handler..."+JSON.stringify(msg[0].epics));
					 var _data = msg[0].epics;
					 // slickgrid needs an _id field.....
					for (var i in _data){
						_data[i]["_id"]=parseInt(i);
					}
					 
					 renderAdminGrid(_data,getConfig(collection));
				 }
				else renderAdminGrid(msg,getConfig(collection));
				
				
			},
		error: function(msg)
			{
				console.log("==== error handler...");
				
			}
		});
		



/*	
	$.when(		$.getJSON(dataSourceFor(collection)))

				$.getJSON(dataSourceFor("targets")),
				$.getJSON(dataSourceFor("metrics")),
				$.getJSON(dataSourceFor("lanetext")),
				$.getJSON(dataSourceFor("scrumteams")),
				$.getJSON(dataSourceFor("v1epics")),
				$.getJSON(dataSourceFor("boards")))

				
//			.done(function(initiatives,targets,metrics,lanetext,scrumteams,v1epics,boards){
			.done(function(data){
					if (data[1]=="success") adminData=data[0];
					else console.log(JSON.stringify(data[1])+" error loading"+collection);

/*
					if (targets[1]=="success") targetData=targets[0];
					else throw new Exception("error loading targets");
					if (metrics[1]=="success")  metricData=metrics[0];
					else throw new Exception("error loading epics");
					if (lanetext[1]=="success")  lanetextData=lanetext[0];
					else throw new Exception("error loading epics");
					if (scrumteams[1]=="success")  teamData=scrumteams[0];
					else throw new Exception("error loading scrumteams");
					if (v1epics[1]=="success")  v1epicData=v1epics[0][0].epics;
					else throw new Exception("error loading scrumteams");
					if (boards[1]=="success")  boardData=boards[0];
					else throw new Exception("error loading boards");
					
					
					// slickgrid needs an _id field.....
					for (var i in v1epicData){
						v1epicData[i]["_id"]=parseInt(i);
					}
					
					
					if (_type=="targets")
						renderAdminGrid(targetData,getTargetConfig());
					else if (_type=="lanetext")
						renderAdminGrid(lanetextData,getLanetextConfig());
					else if (_type=="metrics")
						renderAdminGrid(metricData,getMetricConfig());
					else if (_type=="initiatives")
						renderAdminGrid(initiativeData,getInitiativeConfig());
					else if (_type=="scrumteams")
						renderAdminGrid(teamData,getTeamConfig());
					else if (_type=="boards")
						renderAdminGrid(boardData,getBoardConfig());
					else if (_type=="v1epics")
						renderAdminGrid(v1epicData,getV1EpicsConfig());

					renderAdminGrid(adminData,getConfig(collection));
						
				});
*/
}



function getConfig(collection){

	if (collection=="targets") return getTargetConfig();
	else if (collection=="lanetext") return getLanetextConfig();
	else if (collection=="metrics") return getMetricConfig();
	else if (collection=="initiatives") return getInitiativeConfig();
	else if (collection=="scrumteams") return getTeamConfig();
	else if (collection=="boards") return getBoardConfig();
	else if (collection=="v1epics") return getV1EpicsConfig();
}




function filterByNameValue(list,name,value){
	var _filtererdList = new Array();
	for (var l in list){
		if (list[l][name]==value) _filtererdList.push(list[l]);
	}
	return _filtererdList;
}


function lookupByField(list,field,value){
	for (var i in list){
		//console.log("** checking: "+list[i][field]+" == "+value);
		if (list[i][field]==value) {
			//console.log ("==== MATCH !");
			return list[i];
		}
	}

}

function getInitiativeConfig(){
	
	var _initiatives = [
	
		{ id:"_id", name: "_id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable" },
        { id:"id", name: "id", field: "id",sortable:true,width:40,cssClass:"onKanbanImmutable"},
        { id:"ExtId", name: "ExtId", field: "ExtId",sortable:true,cssClass:"onKanbanImmutable",width:50 },
		{ id:"ExtNumber", name: "v1.number", field: "ExtNumber",sortable:true,cssClass:"onV1"},
         { id: "name", name: "name", field: "name", editor: Slick.Editors.Text ,width:300, cssClass: "cell-title"},
        { id: "name2", name: "name2",  field: "name2",width:150 , editor: Slick.Editors.Text},
        { id: "backlog", name: "backlog",  field: "backlog",width:200, editor: Slick.Editors.Text  },
        { id: "startDate", name: "initial.start", field: "startDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true },
		{ id: "planDate", name: "initial.plan", field: "planDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true ,width:100},
		{ id: "actualDate", name: "actual.plan", field: "actualDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true,width:100 },
	    { id: "v1plannedStart", name: "v1.start", field: "v1plannedStart", sortable:true,cssClass:"onKanbanImmutable",width:80 },
		{ id: "v1plannedEnd", name: "v1.end", field: "v1plannedEnd", sortable:true ,cssClass:"onKanbanImmutable",width:80},
		{ id: "v1launchDate", name: "v1.launch", field: "v1launchDate", sortable:true ,cssClass:"onKanbanImmutable",width:80},
	    { id: "state", name: "state",  field: "state" ,editor: Slick.Editors.SelectCell,options:{"planned":"planned","todo":"todo","done":"done","killed":"killed","onhold":"onhold"}},
        { id: "isCorporate", name: "isCorporate",  field: "isCorporate",width:50 },
        { id: "onKanban", name: "onKanban",  field: "onKanban",width:50,formatter: Slick.Formatters.Checkmark,editor:Slick.Editors.YesNoSelect },
        { id: "progress", name: "progress",  field: "progress" ,width:50,editor:Slick.Editors.Integer},
        { id: "health", name: "health",  field: "health",formatter: Slick.Formatters.RAG,width:50 },
		{ id: "healthComment", name: "healthComment",  field: "healthComment" , editor: Slick.Editors.LongText,width:300},
        { id: "Swag", name: "Swag", field: "Swag",width:50,editor:Slick.Editors.Integer },
		{ id: "status", name: "status",  field: "status" ,width:50,editor: Slick.Editors.Text},
        { id: "Type", name: "Type",  field: "Type" ,width:50,editor: Slick.Editors.Text},
        { id: "cost", name: "cost",  field: "cost" ,width:50,editor:Slick.Editors.Integer},
		 { id: "benefit", name: "benefit",  field: "benefit",width:50 ,editor:Slick.Editors.Integer},
        { id: "dependsOn", name: "dependsOn",  field: "dependsOn" ,editor: Slick.Editors.Text},
        { id: "accuracy", name: "accuracy",  field: "accuracy" ,width:50,editor:Slick.Editors.Integer,width:50},
        { id: "productOwner", name: "productOwner",  field: "productOwner",editor: Slick.Editors.Text,width:150 },
        { id: "businessOwner", name: "businessOwner",  field: "businessOwner" ,editor: Slick.Editors.Text,width:150},
        { id: "programLead", name: "programLead",  field: "programLead",editor: Slick.Editors.Text,width:150 },
		{ id: "DoD", name: "DoD", field: "DoD", editor: Slick.Editors.LongText,width:300},
        { id: "DoR", name: "DoR",  field: "DoR" },
        { id: "createDate", name: "createDate", field: "createDate"},
      
        { id: "changeDate", name: "changeDate",  field: "changeDate",width:150 },
       
    ];
	
	var _config ={};
		_config.mode="editable";
		_config.fields = _initiatives;
		   
	return _config;
	

}

function getMetricConfig(){
	//lanetext
	var _metrics = [
        { id:"id", name: "id", field: "id",sortable:true },
        { id: "lane", name: "lane",  field: "lane",sortable:true },
        { id: "dimension", name: "dimension",  field: "dimension" ,sortable:true, editor: Slick.Editors.Text},
		{ id: "class", name: "class",  field: "class" ,sortable:true, editor: Slick.Editors.Text},
		{ id: "intervalStart", name: "intervalStart",  field: "intervalStart",sortable:true, editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate },
		{ id: "intervalEnd", name: "intervalEnd",  field: "intervalEnd",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate },
		{ id: "forecastDate", name: "forecastDate",  field: "forecastDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate },
		{ id: "number", name: "number",  field: "number",sortable:true,editor:Slick.Editors.Text },
		{ id: "scale", name: "scale",  field: "scale",sortable:true,editor:Slick.Editors.Text },
		{ id: "type", name: "type",  field: "type",sortable:true,editor:Slick.Editors.Text },
		{ id: "sustainable", name: "sustainable",  field: "sustainable",sortable:true,editor:Slick.Editors.Text },
		{ id: "reforecast", name: "reforecast",  field: "reforecast",sortable:true,editor:Slick.Editors.Text },
		{ id: "targets", name: "targets",  field: "targets",sortable:true,editor:Slick.Editors.Text },
		{ id: "direction", name: "direction",  field: "direction",sortable:true,editor:Slick.Editors.Text }
	];
	
	var _config ={};
		_config.mode="editable";
		_config.fields = _metrics;
		   
	return _config;
	
	
}

function getBoardConfig(){
	//lanetext
	var _boards = [
        { id:"_id", name: "_id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable" },
        { id:"id", name: "id", field: "id",sortable:true ,width:15},
        { id: "name", name: "name",  field: "name",sortable:false, editor: Slick.Editors.Text,cssClass: "cell-title",width:200 },
        { id: "vision", name: "vision",  field: "vision" ,sortable:true, editor: Slick.Editors.LongText,width:300},
		{ id: "subvision", name: "subvision",  field: "subvision" ,sortable:true, editor: Slick.Editors.LongText,width:300},
		{ id: "mission", name: "mission",  field: "mission",sortable:true, editor: Slick.Editors.LongText,width:300 },
		{ id: "height", name: "height",  field: "height",sortable:true,editor:Slick.Editors.Integer,width:50 },
		{ id: "width", name: "width",  field: "width",sortable:true,editor:Slick.Editors.Integer,width:50 },
		{ id: "itemScale", name: "itemScale",  field: "itemScale",sortable:true,editor:Slick.Editors.Text },
		{ id: "itemFontScale", name: "itemFontScale",  field: "itemFontScale",sortable:true,editor:Slick.Editors.Text },
		{ id: "laneboxRightWidth", name: "laneboxRightWidth",  field: "laneboxRightWidth",sortable:true,editor:Slick.Editors.Integer,width:50},
		{ id: "startDate", name: "startDate",  field: "startDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate },
		{ id: "endDate", name: "endDate",  field: "endDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate },
		{ id: "WIPWindowDays", name: "WIPWindowDays",  field: "WIPWindowDays",sortable:true,editor:Slick.Editors.Integer,width:50}
		
	];
 
     var _config ={};
		_config.mode="editable";
		_config.fields = _boards;
		   
	return _config;
	
}




function getTargetConfig(){
		//targets
	var _target =[
        { id:"id", name: "id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable"},
        { id:"vision", name: "vision", field: "vision",width:150, editor: Slick.Editors.Text },
        { id: "cluster", name: "cluster", field: "cluster",sortable:true, editor: Slick.Editors.Text ,width:200, cssClass: "cell-title"},
		{ id: "theme", name: "theme",  field: "theme",sortable:true, editor: Slick.Editors.Text },		
		{ id: "group", name: "group",  field: "group",sortable:true,editor: Slick.Editors.Text,width:150},
	    { id: "target", name: "target", field: "target", editor: Slick.Editors.LongText,width:150 },
	    { id: "outcome", name: "outcome", field: "outcome", editor: Slick.Editors.LongText ,width:150},
		{ id: "description", name: "description", field: "description", editor: Slick.Editors.LongText,width:200 },
	    { id: "measure", name: "measure", field: "measure", editor: Slick.Editors.LongText,width:150 },
	    { id: "by when", name: "by when", field: "by when", editor: Slick.Editors.LongText,width:150 },
	    { id: "link", name: "link", field: "link", editor: Slick.Editors.Text,width:150},
        { id: "comments", name: "comments",  field: "comments", editor: Slick.Editors.Text,width:150 }];
	
	var _config ={};
	_config.mode="editable";
	_config.fields = _target;
	   
	return _config;
}

function getTeamConfig(){
		//scrumteams
	var _teams =[
        { id:"id", name: "id", field: "_id",sortable:true,width:30 },
        { id:"teamname", name: "teamname", field: "Teamname",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-title" },
	    { id: "location", name: "location", field: "Location",sortable:true, editor: Slick.Editors.Text},
        { id: "vertical", name: "vertical", field: "Vertical", editor: Slick.Editors.Text ,width:150, cssClass: "cell-title",sortable:true},
        { id: "product", name: "product",  field: "Product",width:150 ,sortable:true},
		{ id: "subproduct", name: "subproduct", field: "SubProduct", editor: Slick.Editors.Text,width:150,sortable:true },
	    { id: "productowner", name: "productowner",  field: "ProductOwner",editor: Slick.Editors.Text,width:150},
	    { id: "apo", name: "apo", field: "APO", editor: Slick.Editors.Text,width:150 },
	    { id: "workingmode", name: "workingmode", field: "Workingmode", editor: Slick.Editors.Text },
	    { id: "teamcreationdate", name: "teamcreationdate", field: "TeamCreateDate", editor: Slick.Editors.SimpleDate },
	    { id: "skills", name: "skills", field: "Skills", editor: Slick.Editors.Text },
        { id: "technologies", name: "technologies",  field: "Technologies", editor: Slick.Editors.Text,width:150 },
        { id: "scope", name: "scope",  field: "Scope", editor: Slick.Editors.Text,width:150 },
        { id: "teamsize", name: "teamsize", field: "Teamsize", editor: Slick.Editors.Number ,width:100, cssClass: "cell-title"},
        { id: "scrummaster", name: "scrummaster", field: "Scrum Master" ,width:150, cssClass: "cell-title"},
	    { id: "podmaster", name: "podMaster",  field: "Podmaster", editor: Slick.Editors.Text },
	    { id: "iscrosscomponent", name: "iscrosscomponent", field: "IsCrosscomponent", editor: Slick.Editors.Text },
        { id: "selfformation", name: "selfformation",  field: "Self-formation?" , editor: Slick.Editors.Text}];
        
       	var _config ={};
		_config.mode="editable";
		_config.fields = _teams;
		   
	return _config;
       
	
}


function getV1EpicsConfig(){
		//v1 epics
	var _v1Epics =[
        { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
        { id: "number", name: "number", field: "Number",width:50, cssClass: "cell-title",sortable:true},
        { id: "name", name: "name", field: "Name",sortable:true,width:350,cssClass: "cell-title" },
        { id: "status", name: "status", field: "Status", width:150 ,sortable:true},
        { id: "scope", name: "scope",  field: "Scope",width:150 ,sortable:true},
        { id: "swag", name: "swag", field: "Swag", width:50, cssClass: "cell-title",sortable:true},
        { id: "plannedEnd", name: "plannedEnd", field: "PlannedEnd", width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-title",sortable:true},
        { id: "plannedStart", name: "plannedStart", field: "PlannedStart",formatter: Slick.Formatters.SimpleDate,width:100, cssClass: "cell-title",sortable:true},
        { id: "health", name: "health", field: "Health", width:150, cssClass: "cell-title",formatter: Slick.Formatters.RAG,width:50 ,sortable:true},
        { id: "capitalizable", name: "capitalizable", field: "Capitalizable", width:20, cssClass: "cell-title",sortable:true},
        { id: "createdBy", name: "createdBy", field: "CreatedBy", width:150, cssClass: "cell-title",sortable:true},
        { id: "changedBy", name: "changedBy", field: "ChangedBy", width:150, cssClass: "cell-title",sortable:true},
        { id: "categoryName", name: "categoryName", field: "CategoryName",width:150, cssClass: "cell-title",sortable:true},
        { id: "risk", name: "Risk", field: "risk",width:30, cssClass: "cell-title",sortable:true},
        { id: "value", name: "Value", field: "value",width:30, cssClass: "cell-title",sortable:true},
        { id: "healthComment", name: "healthComment", field: "HealthComment" ,width:150, cssClass: "cell-title",sortable:true},
        { id: "description", name: "description", field: "Description",width:150, cssClass: "cell-title",sortable:true}];
        
        
	var _config ={};
	_config.mode="readonly";
	_config.fields = _v1Epics;
	   
	return _config;
}



function getIncidentsConfig(){
		//scrumteams
	var _incidents =[
        { id:"id", name: "id", field: "Number",sortable:true,width:30 },
        { id:"Description", name: "Description", field: "Short description",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-title" },
        { id: "Urgency", name: "Urgency", field: "Urgency", editor: Slick.Editors.Text ,width:150, cssClass: "cell-title",sortable:true},
        { id: "Impact", name: "Impact",  field: "Impact",width:150 ,sortable:true},
		{ id: "Priority", name: "Priority", field: "Priority", editor: Slick.Editors.Text,width:150,sortable:true }];
	   
	return _incidents;
}




function renderAdminGrid(data,conf){

	var columns = [];

	


	var checkboxSelector = new Slick.CheckboxSelectColumn({
		  cssClass: "slick-cell-checkboxsel"
		});
		
	
	var _editable = true;
	if (conf.mode=="readonly") _editable = false
	
	// adds element in beginning of array
	if (_editable) conf.fields.unshift(checkboxSelector.getColumnDefinition());
	
	columns= columns.concat(conf.fields);

	


	var options = {
		editable: _editable,
		enableAddRow: _editable,
		enableCellNavigation: true,
		asyncEditorLoading: false,
		cellHighlightCssClass: "changed",
		//multiColumnSort: true,
		 autoEdit: true,
		showHeaderRow:true,
		explicitInitialization:true,
		autoHeight: true
		
	}
 
	var dataView = new Slick.Data.DataView();
	dataView.setItems(data,"_id");

    admingrid = new Slick.Grid("#adminGrid", dataView, columns, options);
	
	admingrid.onAddNewRow.subscribe(function (e, args) {
      console.log("[DEBUG] onAddNewRow() fired");
      var item = args.item;
      item.id=0;
      dataView.addItem(item);
    });


    
    admingrid.onSort.subscribe(function (e, args) {
		//console.log("**** sorting..by: "+args.sortCol.field);
		 var comparer = function(a, b) {
			return (a[args.sortCol.field] > b[args.sortCol.field]) ? 1 : -1;
		}

		// Delegate the sorting to DataView.
		// This will fire the change events and update the grid.
		dataView.sort(comparer, args.sortAsc);
	});
	
    

    dataView.onRowsChanged.subscribe(function(e,args) {
		console.log("[DEBUG] onRowsChanged() fired");
		admingrid.invalidateRows(args.rows);
		admingrid.render();
	});
	
	
	admingrid.onCellChange.subscribe(function(e,args){
		console.log("[DEBUG] ***** CellChanged: "+args);
	});
	
	// ----------------------- column filter --------------------------------
	$(admingrid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      console.log("~~~~ keyup");
      
      var columnId = $(this).data("columnId");
       console.log("* columnId: "+columnId);
      if (columnId != null) {
        columnFilters[columnId] = $.trim($(this).val());
        dataView.refresh();
      }
    });
    
    
    //from query GET string
    if (_id){
		columnFilters["_id"] = _id;
	}
    
	
	admingrid.onHeaderRowCellRendered.subscribe(function(e, args) {
        $(args.node).empty();
        $("<input type='text'>")
           .data("columnId", args.column.id)
           .val(columnFilters[args.column.id])
           .appendTo(args.node);
    });

	
	admingrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
    admingrid.registerPlugin(checkboxSelector);
    
    
    var columnpicker = new Slick.Controls.ColumnPicker(columns, admingrid, options);
	
    admingrid.init(); 
    
    // default sort column
    dataView.sort(function(a, b) {
		return (new Date(a["ChangeDateUTC"]) > new Date(b["ChangeDateUTC"])) ? 1 : -1;
	},false);
     
     
   
    dataView.setFilter(filter);
   
	// ------------------------  column filter ---------------------------------- 
     
}



/**
* for column filter prototype
*/

function filter(item) {
    console.log("##### filter called:");
    
    for (var columnId in columnFilters) {
      if (columnId !== undefined && columnFilters[columnId] !== "") {
        console.log("**** filter triggered: columnId: "+ columnFilters[columnId]);
        var c = admingrid.getColumns()[admingrid.getColumnIndex(columnId)];
        console.log("**** filter triggered: c: "+item[c.field]);
        //
        if (item[c.field] == undefined) return false;
        if (item[c.field].indexOf(columnFilters[columnId])==-1) {
          return false;
        }
      }
    }
    
    return true;
  }


// Define some sorting functions
function NumericSorter(a, b) {
  var x = a[sortcol], y = b[sortcol];
  return sortdir * (x == y ? 0 : (x > y ? 1 : -1));
}


var syncList; 

var itemInsertList; 


d3.select("#bremove").on("click", function(){
		console.log("REMOVE selected rows: "+admingrid.getSelectedRows());
		
		
		deleteList = new Array();
		
		var _sel = admingrid.getSelectedRows();
		for (var s in _sel){
				deleteList.push(admingrid.getData().getItem(_sel[s])["_id"]);
		}
	
		//kanban_utils.js
		ajaxCall("DELETE","remove",deleteList,_type,refresh);
		
	
	});
	
	

d3.select("#bsave").on("click", function(){
		console.log("[DEBUG] SAVE selected rows: "+admingrid.getSelectedRows());
		
		saveList = new Array();
		
		var _sel = admingrid.getSelectedRows();
		
		for (var s in _sel){
				saveList.push(admingrid.getData().getItem(_sel[s]));
		}
		
		//kanban_utils.js
		ajaxCall("POST","save",saveList,_type,refresh);
		
	});	













