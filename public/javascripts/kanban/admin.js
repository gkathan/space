var _excelExportURL = '/api/kanbanv2/export/xlsx/';

var admingrid;
  
var columnFilters={};

var _type=getUrlVars()["type"];
var _filter=getUrlVars()["filter"];
var _id =getUrlVars()["_id"];

//set link for excel download
document.getElementById("lexcel").href=_excelExportURL+_type;
$("#admintype").text(_type);

initShortcuts();
refresh(_type);


function refresh(collection){
		$.ajax({
		type: "GET",
		url: dataSourceFor(collection),
		cache: true,
		success: function(data)
			{
				var _data = data;
				
				if (collection=="v1epics"){
					 _data = data[0].epics;
				}
				// check for "_id" field
				if (_data[0]._id == undefined){
					 // slickgrid needs an _id field.....
					for (var i in _data){
						_data[i]["_id"]=parseInt(i);
					}
				}
				renderAdminGrid(_data,getConfig(collection));
			},
		error: function(msg)
			{
				console.log("==== error handler...");
			}
		});
}



function getConfig(collection){
	switch(collection){
		case "targets": return getTargetConfig();
		case "metrics": return getMetricConfig();
		case "initiatives": return getInitiativeConfig();
		case "scrumteams": return getTeamConfig();
		case "boards": return getBoardConfig();
		case "v1epics": return getV1EpicsConfig();
		case "incidents": return getIncidentsConfig();
		case "labels": return getLabelsConfig();
		case "customers": return getCustomersConfig();
		case "competitors": return getCompetitorsConfig();
	}
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
        { id: "name2", name: "name2",  field: "name2",width:150 , editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "backlog", name: "backlog",  field: "backlog",width:200, editor: Slick.Editors.Text, cssClass: "cell-standard"  },
        { id: "startDate", name: "initial.start", field: "startDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true, cssClass: "cell-standard" },
		{ id: "planDate", name: "initial.plan", field: "planDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true ,width:100, cssClass: "cell-standard"},
		{ id: "actualDate", name: "actual.plan", field: "actualDate", editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate,sortable:true,width:100, cssClass: "cell-standard" },
	    { id: "v1plannedStart", name: "v1.start", field: "v1plannedStart", sortable:true,cssClass:"onKanbanImmutable",width:80 },
		{ id: "v1plannedEnd", name: "v1.end", field: "v1plannedEnd", sortable:true ,cssClass:"onKanbanImmutable",width:80},
		{ id: "v1launchDate", name: "v1.launch", field: "v1launchDate", sortable:true ,cssClass:"onKanbanImmutable",width:80},
	    { id: "state", name: "state",  field: "state" ,editor: Slick.Editors.SelectCell,options:{"planned":"planned","todo":"todo","done":"done","killed":"killed","onhold":"onhold", cssClass: "cell-standard"}},
        { id: "isCorporate", name: "isCorporate",  field: "isCorporate",width:50 , cssClass: "cell-standard"},
        { id: "onKanban", name: "onKanban",  field: "onKanban",width:50,formatter: Slick.Formatters.Checkmark,editor:Slick.Editors.YesNoSelect, cssClass: "cell-standard" },
        { id: "progress", name: "progress",  field: "progress" ,width:50,editor:Slick.Editors.Integer, cssClass: "cell-standard"},
        { id: "health", name: "health",  field: "health",formatter: Slick.Formatters.RAG,width:50 },
		{ id: "healthComment", name: "healthComment",  field: "healthComment" , editor: Slick.Editors.LongText,width:300, cssClass: "cell-standard"},
        { id: "Swag", name: "Swag", field: "Swag",width:50,editor:Slick.Editors.Integer, cssClass: "cell-standard" },
		{ id: "status", name: "status",  field: "status" ,width:50,editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "Type", name: "Type",  field: "Type" ,width:50,editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "cost", name: "cost",  field: "cost" ,width:50,editor:Slick.Editors.Integer, cssClass: "cell-standard"},
		{ id: "benefit", name: "benefit",  field: "benefit",width:50 ,editor:Slick.Editors.Integer, cssClass: "cell-standard"},
        { id: "dependsOn", name: "dependsOn",  field: "dependsOn" ,editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "accuracy", name: "accuracy",  field: "accuracy" ,width:50,editor:Slick.Editors.Integer,width:50, cssClass: "cell-standard"},
        { id: "productOwner", name: "productOwner",  field: "productOwner",editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
        { id: "businessOwner", name: "businessOwner",  field: "businessOwner" ,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
        { id: "programLead", name: "programLead",  field: "programLead",editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
		{ id: "DoD", name: "DoD", field: "DoD", editor: Slick.Editors.LongText,width:300, cssClass: "cell-standard"},
        { id: "DoR", name: "DoR",  field: "DoR", cssClass: "cell-standard" },
        { id: "createDate", name: "createDate", field: "createDate", cssClass: "cell-standard"},
        { id: "changeDate", name: "changeDate",  field: "changeDate",width:150 , cssClass: "cell-standard"},
    ];
	var _config ={};
		_config.mode="editable";
		_config.fields = _initiatives;
	return _config;
}


function getMetricConfig(){
	//lanetext
	var _metrics = [
        { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
        { id: "lane", name: "lane",  field: "lane",sortable:true, cssClass: "cell-standard" },
        { id: "dimension", name: "dimension",  field: "dimension" ,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "class", name: "class",  field: "class" ,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "intervalStart", name: "intervalStart",  field: "intervalStart",sortable:true, editor: Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
		{ id: "intervalEnd", name: "intervalEnd",  field: "intervalEnd",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate , cssClass: "cell-standard"},
		{ id: "forecastDate", name: "forecastDate",  field: "forecastDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
		{ id: "number", name: "number",  field: "number",sortable:true,editor:Slick.Editors.Text , cssClass: "cell-standard"},
		{ id: "scale", name: "scale",  field: "scale",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "type", name: "type",  field: "type",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "sustainable", name: "sustainable",  field: "sustainable",sortable:true,editor:Slick.Editors.Text , cssClass: "cell-standard"},
		{ id: "reforecast", name: "reforecast",  field: "reforecast",sortable:true,editor:Slick.Editors.Text , cssClass: "cell-standard"},
		{ id: "targets", name: "targets",  field: "targets",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "direction", name: "direction",  field: "direction",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" }];
	var _config ={};
		_config.mode="editable";
		_config.fields = _metrics;
	return _config;
}

function getBoardConfig(){
	//lanetext
	var _boards = [
        { id:"_id", name: "_id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable" },
        { id:"id", name: "id", field: "id",sortable:true ,width:15, cssClass: "cell-standard"},
        { id: "name", name: "name",  field: "name",sortable:false, editor: Slick.Editors.Text,cssClass: "cell-title",width:200 },
        { id: "vision", name: "vision",  field: "vision" ,sortable:true, editor: Slick.Editors.LongText,width:300, cssClass: "cell-standard"},
		{ id: "subvision", name: "subvision",  field: "subvision" ,sortable:true, editor: Slick.Editors.LongText,width:300, cssClass: "cell-standard"},
		{ id: "mission", name: "mission",  field: "mission",sortable:true, editor: Slick.Editors.LongText,width:300 , cssClass: "cell-standard"},
		{ id: "height", name: "height",  field: "height",sortable:true,editor:Slick.Editors.Integer,width:50 , cssClass: "cell-standard"},
		{ id: "width", name: "width",  field: "width",sortable:true,editor:Slick.Editors.Integer,width:50 , cssClass: "cell-standard"},
		{ id: "itemScale", name: "itemScale",  field: "itemScale",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "itemFontScale", name: "itemFontScale",  field: "itemFontScale",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "laneboxRightWidth", name: "laneboxRightWidth",  field: "laneboxRightWidth",sortable:true,editor:Slick.Editors.Integer,width:50, cssClass: "cell-standard"},
		{ id: "startDate", name: "startDate",  field: "startDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
		{ id: "endDate", name: "endDate",  field: "endDate",sortable:true,editor:Slick.Editors.Date,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
		{ id: "WIPWindowDays", name: "WIPWindowDays",  field: "WIPWindowDays",sortable:true,editor:Slick.Editors.Integer,width:50, cssClass: "cell-standard"}];
     var _config ={};
		_config.mode="editable";
		_config.fields = _boards;
	return _config;
}


function getTargetConfig(){
		//targets
	var _target =[
        { id:"id", name: "id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable"},
        { id:"vision", name: "vision", field: "vision",width:150, editor: Slick.Editors.Text, cssClass: "cell-standard" },
        { id: "cluster", name: "cluster", field: "cluster",sortable:true, editor: Slick.Editors.Text ,width:200, cssClass: "cell-title"},
		{ id: "theme", name: "theme",  field: "theme",sortable:true, editor: Slick.Editors.Text , cssClass: "cell-standard"},		
		{ id: "group", name: "group",  field: "group",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
	    { id: "target", name: "target", field: "target", editor: Slick.Editors.LongText,width:150, cssClass: "cell-standard" },
	    { id: "outcome", name: "outcome", field: "outcome", editor: Slick.Editors.LongText ,width:150, cssClass: "cell-standard"},
		{ id: "description", name: "description", field: "description", editor: Slick.Editors.LongText,width:200, cssClass: "cell-standard" },
	    { id: "baseline", name: "baseline", field: "baseline", editor: Slick.Editors.LongText,width:150 , cssClass: "cell-standard"},
	    { id: "measure", name: "measure", field: "measure", editor: Slick.Editors.LongText,width:150 , cssClass: "cell-standard"},
	    { id: "by when", name: "by when", field: "by when", editor: Slick.Editors.LongText,width:150, cssClass: "cell-standard" },
	    { id: "link", name: "link", field: "link", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
        { id: "comments", name: "comments",  field: "comments", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
        { id: "contributors", name: "contributors",  field: "contributors", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
        { id: "sponsor", name: "sponsor",  field: "sponsor", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
        { id: "start", name: "start",  field: "start", editor: Slick.Editors.Date,width:150, cssClass: "cell-standard" },
        { id: "end", name: "end",  field: "end", editor: Slick.Editors.Date,width:150, cssClass: "cell-standard" }
        ];
	var _config ={};
	_config.mode="editable";
	_config.fields = _target;
	return _config;
}


function getTeamConfig(){
		//scrumteams
	var _teams =[
        { id:"id", name: "id", field: "_id",sortable:true,width:30 ,cssClass:"onKanbanImmutable"},
        { id:"teamname", name: "teamname", field: "Teamname",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-title" },
	    { id: "location", name: "location", field: "Location",sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "vertical", name: "vertical", field: "Vertical", editor: Slick.Editors.Text ,width:150, cssClass: "cell-title",sortable:true},
        { id: "product", name: "product",  field: "Product",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "subproduct", name: "subproduct", field: "SubProduct", editor: Slick.Editors.Text,width:150,sortable:true, cssClass: "cell-standard" },
	    { id: "productowner", name: "productowner",  field: "ProductOwner",editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
	    { id: "apo", name: "apo", field: "APO", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
	    { id: "workingmode", name: "workingmode", field: "Workingmode", editor: Slick.Editors.Text, cssClass: "cell-standard" },
	    { id: "teamcreationdate", name: "teamcreationdate", field: "TeamCreateDate", editor: Slick.Editors.SimpleDate, cssClass: "cell-standard" },
	    { id: "skills", name: "skills", field: "Skills", editor: Slick.Editors.Text, cssClass: "cell-standard" },
        { id: "technologies", name: "technologies",  field: "Technologies", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
        { id: "scope", name: "scope",  field: "Scope", editor: Slick.Editors.Text,width:150 , cssClass: "cell-standard"},
        { id: "teamsize", name: "teamsize", field: "Teamsize", editor: Slick.Editors.Number ,width:100, cssClass: "cell-title"},
        { id: "scrummaster", name: "scrummaster", field: "Scrum Master" ,width:150, cssClass: "cell-title"},
	    { id: "podmaster", name: "podMaster",  field: "Podmaster", editor: Slick.Editors.Text, cssClass: "cell-standard" },
	    { id: "iscrosscomponent", name: "iscrosscomponent", field: "IsCrosscomponent", editor: Slick.Editors.Text, cssClass: "cell-standard" },
        { id: "selfformation", name: "selfformation",  field: "Self-formation?" , editor: Slick.Editors.Text, cssClass: "cell-standard"}];
       	var _config ={};
		_config.mode="editable";
		_config.fields = _teams;
	return _config;
}


function getV1EpicsConfig(){
		//v1 epics
	var _v1Epics =[
        { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
        { id: "number", name: "number", field: "Number",width:50, cssClass: "cell-standard",sortable:true},
        { id: "name", name: "name", field: "Name",sortable:true,width:350,cssClass: "cell-title" },
        { id: "status", name: "status", field: "Status", width:150 ,sortable:true, cssClass: "cell-standard"},
        { id: "scope", name: "scope",  field: "Scope",width:150 ,sortable:true, cssClass: "cell-standard"},
        { id: "swag", name: "swag", field: "Swag", width:50, cssClass: "cell-standard",sortable:true},
        { id: "plannedEnd", name: "plannedEnd", field: "PlannedEnd", width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard",sortable:true},
        { id: "plannedStart", name: "plannedStart", field: "PlannedStart",formatter: Slick.Formatters.SimpleDate,width:100, cssClass: "cell-standard",sortable:true},
        { id: "health", name: "health", field: "Health", width:150, cssClass: "cell-title",formatter: Slick.Formatters.RAG,width:50 ,sortable:true},
        { id: "capitalizable", name: "capitalizable", field: "Capitalizable", width:20, cssClass: "cell-standard",sortable:true},
        { id: "createdBy", name: "createdBy", field: "CreatedBy", width:150, cssClass: "cell-standard",sortable:true},
        { id: "changedBy", name: "changedBy", field: "ChangedBy", width:150, cssClass: "cell-standard",sortable:true},
        { id: "categoryName", name: "categoryName", field: "CategoryName",width:150, cssClass: "cell-standard",sortable:true},
        { id: "risk", name: "Risk", field: "risk",width:30, cssClass: "cell-standard",sortable:true},
        { id: "value", name: "Value", field: "value",width:30, cssClass: "cell-standard",sortable:true},
        { id: "healthComment", name: "healthComment", field: "HealthComment" ,width:150, cssClass: "cell-standard",sortable:true},
        { id: "description", name: "description", field: "Description",width:150, cssClass: "cell-standard",sortable:true},
        { id: "attachments", name: "attachements", field: "EpicAttachments",width:150, cssClass: "cell-standard",sortable:true}];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _v1Epics;
	return _config;
}



function getIncidentsConfig(){
	var _incidents =[
        { id:"id", name: "id", field: "Number",sortable:true,width:30,cssClass:"onKanbanImmutable" },
        { id:"Description", name: "Description", field: "Short description",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
        { id: "Urgency", name: "Urgency", field: "Urgency", editor: Slick.Editors.Text ,width:150, cssClass: "cell-standard",sortable:true},
        { id: "Impact", name: "Impact",  field: "Impact",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "Priority", name: "Priority", field: "Priority", editor: Slick.Editors.Text,width:150,sortable:true, cssClass: "cell-standard" }];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _incidents;
	return _config;
}


function getLabelsConfig(){
	var _labels =[
        { id:"id", name: "id", field: "_id",sortable:true,width:30,cssClass:"onKanbanImmutable" },
        { id:"market", name: "market", field: "market",sortable:true,width:150, editor: Slick.Editors.Text, cssClass: "cell-standard"},
        { id: "brand", name: "brand", field: "brand", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "label", name: "label",  field: "label", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-title"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _labels;
	return _config;
}


function getCustomersConfig(){
	var _customers =[
        { id:"id", name: "id", field: "_id",sortable:true,width:30,cssClass:"onKanbanImmutable" },
        { id:"name", name: "name", field: "name",sortable:true,width:150, editor: Slick.Editors.Text, cssClass: "cell-title"},
        { id: "type", name: "type", field: "type", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "status", name: "status",  field: "status", editor: Slick.Editors.Text ,sortable:true,width:150 ,cssClass: "cell-standard"},
        { id: "description", name: "description",  field: "description", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"},
        { id: "scope", name: "scope",  field: "scope", editor: Slick.Editors.Text ,sortable:true,width:150 ,cssClass: "cell-standard"},
        { id: "market", name: "market",  field: "market", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"},
        { id: "contact", name: "contact",  field: "contact", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-title"},
        { id: "keyaccounter", name: "keyaccounter",  field: "keyaccounter", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"},
        { id: "url", name: "url",  field: "url", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _customers;
	return _config;
}


function getCompetitorsConfig(){
	var _competitors =[
        { id: "id", name: "id", field: "_id",sortable:true,width:30,cssClass:"onKanbanImmutable" },
        { id: "name", name: "name", field: "name",sortable:true,width:150, editor: Slick.Editors.Text, cssClass: "cell-title"},
        { id: "offer", name: "offer", field: "offer", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "description", name: "description",  field: "description", editor: Slick.Editors.LongText ,width:150 ,cssClass: "cell-standard"},
        { id: "type", name: "type", field: "type", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "marketcap", name: "marketcap", field: "marketcap", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "stock", name: "stock", field: "stock", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "stocklink", name: "stocklink", field: "stocklink", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
        { id: "products", name: "products",  field: "products", editor: Slick.Editors.Text ,sortable:true,width:150 ,cssClass: "cell-standard"},
        { id: "markets", name: "markets",  field: "markets", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"},
        { id: "url", name: "url",  field: "url", editor: Slick.Editors.Text ,width:150 ,cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _competitors;
	return _config;
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
		enableAddRow: false,
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
		 var comparer = function(a, b) {
			return (a[args.sortCol.field] > b[args.sortCol.field]) ? 1 : -1;
		}
		// Delegate the sorting to DataView.
		// This will fire the change events and update the grid.
		dataView.sort(comparer, args.sortAsc);
	});

    dataView.onRowsChanged.subscribe(function(e,args) {
		admingrid.invalidateRows(args.rows);
		admingrid.render();
	});
	
	
	admingrid.onCellChange.subscribe(function(e,args){
	});
	
	// ----------------------- column filter --------------------------------
	$(admingrid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      //console.log("~~~~ keyup");
      var columnId = $(this).data("columnId");
      //console.log("* columnId: "+columnId);
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


  function requiredFieldValidator(value) {
    if (value == null || value == undefined || !value.length) {
      return {valid: false, msg: "This is a required field"};
    } else {
      return {valid: true, msg: null};
    }
  }













