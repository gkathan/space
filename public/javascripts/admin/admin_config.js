function getConfig(collection){
	switch(collection){
		case "targets": return getTargetConfig();
		case "metrics": return getMetricConfig();
		case "initiatives": return getInitiativeConfig();
		case "scrumteams": return getTeamConfig();
		case "v1teams": return getV1TeamConfig();
		case "boards": return getBoardConfig();
		case "v1epics": return getV1EpicsConfig();
		case "incidents": return getIncidentsConfig();
		case "incidentsoldsnow": return getIncidentsOldSnowConfig();
		case "problems": return getProblemsConfig();
		case "labels": return getLabelsConfig();
		case "customers": return getCustomersConfig();
		case "competitors": return getCompetitorsConfig();
		case "organization": return getOrganizationConfig();
		case "productcatalog": return getProductCatalogConfig();
		case "roadmaps": return getRoadmapConfig();
		case "availability":  return getAvailabilityConfig();
		case "firereport":  return getFirereportConfig();
		case "content":  return getContentConfig();
    case "incidenttracker":  return getIncidenttrackerConfig();
		case "domains":  return getDomainsConfig();
		case "socoutages" : return getSOCOutagesConfig();
		case "socservices" : return getSOCServicesConfig();
		case "socincident2revenueimpact" : return getSOCIncident2RevenueImpactConfig();
		case "roadmapinitiatives" : return getRoadmapInitiativesConfig();

	}

}

function getInitiativeConfig(){
	var _initiatives = [
		{ id:"_id", name: "_id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable" },
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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

function getProductCatalogConfig(){
	var _productcatalog = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
  	{ id: "type", name: "type",  field: "Type",sortable:true, cssClass: "cell-standard" },
    { id: "offering", name: "offering",  field: "Offering" ,width:200,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "family", name: "family",  field: "Family" ,sortable:true,width:200, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "name", name: "name",  field: "Name",sortable:true,width:200, editor: Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "description", name: "description",  field: "Description",width:200,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "version", name: "version",  field: "Version",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "owner", name: "owner",  field: "Owner",sortable:true,editor:Slick.Editors.Text , cssClass: "cell-standard"},
		{ id: "comments", name: "comments",  field: "Comments",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "dependsOn", name: "dependsOn",  field: "DependsOn",sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "consumedBy", name: "consumedBy",  field: "ConsumedBy",sortable:true,editor:Slick.Editors.Text , cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _productcatalog;
	return _config;
}



function getDomainsConfig(){
	var _domains = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
    { id: "domainName", name: "domainName",  field: "domainName",sortable:true, cssClass: "cell-standard",width:250 },
    { id: "aRecords", name: "aRecords",  field: "aRecords",sortable:true, cssClass: "cell-standard",width:250 },
    { id: "httpLogStatus", name: "httpLogStatus",  field: "httpLogStatus" ,width:200,sortable:true, cssClass: "cell-standard"},
		{ id: "httpLogRedirec", name: "httpLogRedirect",  field: "httpLogRedirect" ,width:200,sortable:true, cssClass: "cell-standard"},
		{ id: "httpsLogStatus", name: "httpsLogStatus",  field: "httpsLogStatus" ,sortable:true,width:200, cssClass: "cell-standard"}
	];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _domains;
	return _config;
}

function getSOCIncident2RevenueImpactConfig(){
	var _inc2revimpact = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
    { id: "incident", name: "incidentId",  field: "incident",editor:Slick.Editors.Text,sortable:true, cssClass: "cell-standard",width:150 },
    { id: "impact", name: "revenueImpact",  field: "impact",editor:Slick.Editors.Text,sortable:true, cssClass: "cell-standard",width:150 }

	];
	var _config ={};
	_config.mode="editable";
	_config.fields = _inc2revimpact;
	_config.addRow="enabled";
	return _config;
}


function getAvailabilityConfig(){
	var _availability = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id: "year", name: "year",  field: "year",sortable:true, cssClass: "cell-standard" },
    { id: "week", name: "week",  field: "week" ,width:200,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "unplannedYTD", name: "unplannedYTD",  field: "unplannedYTD" ,sortable:true,width:200, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "plannedYTD", name: "plannedYTD",  field: "plannedYTD",sortable:true,width:200, editor: Slick.Editors.Text, cssClass: "cell-standard" },
		{ id: "totalYTD", name: "totalYTD",  field: "totalYTD",width:200,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _availability;
	return _config;
}

function getFirereportConfig(){
	var _firereport = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id: "year", name: "year",  field: "year" ,width:70,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "type", name: "type",  field: "type",sortable:true, cssClass: "cell-standard" },
    { id: "count", name: "count",  field: "count" ,sortable:true,width:50, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "path", name: "path",  field: "path",width:250,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "contact", name: "contact",  field: "contact",width:200,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _firereport;
	return _config;
}


function getContentConfig(){
	var _content = [
    { id:"id", name: "id", field: "_id",sortable:true,cssClass:"onKanbanImmutable" },
    { id: "context", name: "context",  field: "context" ,width:80,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "type", name: "type",  field: "type",width:100,sortable:true, editor: Slick.Editors.Text,sortable:true, cssClass: "cell-standard" },
    { id: "headline", name: "headline",  field: "headline" ,sortable:true,width:200, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "content", name: "content",  field: "content",width:400,sortable:true,editor:Slick.Editors.LongText, cssClass: "cell-standard"},
		{ id: "date", name: "date",  field: "date",width:80,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "status", name: "status",  field: "status",width:80,sortable:true,editor:Slick.Editors.Text, cssClass: "cell-standard"}
	];
	var _config ={};
	_config.mode="editable";
	_config.addRow="enabled";
	_config.fields = _content;
	return _config;
}


function getBoardConfig(){
	//lanetext
	var _boards = [
    { id:"_id", name: "_id", field: "_id",sortable:true,width:150,cssClass:"onKanbanImmutable" },
		{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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
    { id:"_id", name: "_id", field: "_id",sortable:true,width:50,cssClass:"onKanbanImmutable"},
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id:"profit", name: "profit", field: "profit",sortable:true,width:50,cssClass:"onKanbanImmutable"},
    { id:"id", name: "id", field: "id",sortable:true,width:50,cssClass:"onKanbanImmutable"},
    { id:"type", name: "type", field: "type",width:80, editor: Slick.Editors.Text, cssClass: "cell-standard" },
    { id:"rag", name: "rag", field: "rag",sortable:true,width:10, editor: Slick.Editors.Text,formatter: Slick.Formatters.RAG,  cssClass: "cell-standard" },
    { id:"ragComment", name: "ragComment", field: "ragComment",width:10, editor: Slick.Editors.Text,formatter: Slick.Formatters.RAG,  cssClass: "cell-standard" },
    { id: "sponsor", name: "sponsor",  field: "sponsor", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
    { id: "cluster", name: "cluster", field: "cluster",sortable:true, editor: Slick.Editors.Text ,width:200, cssClass: "cell-title"},
		{ id: "theme", name: "theme",  field: "theme",sortable:true, editor: Slick.Editors.Text , cssClass: "cell-standard"},
		{ id: "group", name: "group",  field: "group",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "target", name: "target", field: "target", editor: Slick.Editors.LongText,width:350, cssClass: "cell-standard" },
    { id: "dashboardTop", name: "dashboardTop",  field: "dashboardTop",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "dashboardDetail", name: "dashboardDetail",  field: "dashboardDetail",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "directMetric", name: "directMetric", field: "directMetric", editor: Slick.Editors.Text,width:100, cssClass: "cell-standard" },
    { id: "directMetricScale", name: "directMetricScale", field: "directMetricScale", editor: Slick.Editors.Text,width:50, cssClass: "cell-standard" },
    { id: "directTarget", name: "directTarget", field: "directTarget", editor: Slick.Editors.Text,width:50, cssClass: "cell-standard" },
    { id: "directTime", name: "directTime", field: "directTime", editor: Slick.Editors.Text,width:50, cssClass: "cell-standard" },
    { id: "outcome", name: "outcome", field: "outcome", editor: Slick.Editors.LongText ,width:150, cssClass: "cell-standard"},
		{ id: "description", name: "description", field: "description", editor: Slick.Editors.LongText,width:200, cssClass: "cell-standard" },
    { id:"vision", name: "vision", field: "vision",width:150, editor: Slick.Editors.Text, cssClass: "cell-standard" },
  	{ id: "icon", name: "icon",  field: "icon",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "icon_theme", name: "icon_theme",  field: "icon_theme",sortable:true,editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "baseline", name: "baseline", field: "baseline", editor: Slick.Editors.LongText,width:150 , cssClass: "cell-standard"},
    { id: "measure", name: "measure", field: "measure", editor: Slick.Editors.LongText,width:150 , cssClass: "cell-standard"},
    { id: "by when", name: "by when", field: "by when", editor: Slick.Editors.LongText,width:150, cssClass: "cell-standard" },
    { id: "link", name: "link", field: "link", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
    { id: "comments", name: "comments",  field: "comments", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
    { id: "contributors", name: "contributors",  field: "contributors", editor: Slick.Editors.Text,width:150, cssClass: "cell-standard" },
    { id: "start", name: "start",  field: "start", editor: Slick.Editors.Text,width:150,formatter: Slick.Formatters.SimpleDate,cssClass: "cell-standard" },
    { id: "end", name: "end",  field: "end", editor: Slick.Editors.Text,width:150,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" }
  ];
	var _config ={};
	_config.mode="editable";
	_config.fields = _target;
	return _config;
}

function getRoadmapConfig(){
		//targets
	var _target =[
    { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id:"area", name: "area", field: "area",width:80, editor: Slick.Editors.Text, cssClass: "cell-standard" },
    { id: "lane", name: "lane", field: "lane",sortable:true, editor: Slick.Editors.Text ,width:80, cssClass: "cell-title"},
    { id: "name", name: "name",  field: "name",width:200,sortable:true, editor: Slick.Editors.Text , cssClass: "cell-standard"},
    { id: "type", name: "type",  field: "type",sortable:true,editor: Slick.Editors.Text,width:80, cssClass: "cell-standard"},
    { id: "startDate", name: "startDate", field: "startDate", editor: Slick.Editors.LongText,width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
    { id: "endDate", name: "endDate", field: "endDate", editor: Slick.Editors.Text,width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard" },
    { id: "version", name: "version", field: "version", editor: Slick.Editors.Text,width:50, cssClass: "cell-standard" },
    { id: "description", name: "description", field: "description", editor: Slick.Editors.LongText ,width:150, cssClass: "cell-standard"}
  ];
	var _config ={};
	_config.mode="editable";
	_config.fields = _target;
	return _config;
}

function getIncidenttrackerConfig(){
	var _incidenttracker =[
    { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
    { id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id:"date", name: "date", field: "date",sortable:true,width:80, editor: Slick.Editors.Text, formatter:Slick.Formatters.SimpleDate,cssClass: "cell-standard" },
    { id: "P1", name: "P1", field: "P1", editor: Slick.Editors.Number ,width:40, cssClass: "cell-title"},
    { id: "P8", name: "P8",  field: "P8",width:40, editor: Slick.Editors.Number , cssClass: "cell-title"}
  ];
	var _config ={};
	_config.mode="editable";
  _config.addRow="enabled";
	_config.fields = _incidenttracker;
	return _config;
}

function getSOCOutagesConfig(){
	var _socoutages =[
    { id: "id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
    { id: "context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
		{ id: "snowId", name: "snowId",  field: "snowId",width:150,  formatter:Slick.Formatters.SnowIncidentURL,editor: Slick.Editors.Number , cssClass: "cell-standard"},
    { id: "incidentID", name: "incidentID",  field: "incidentID",width:100, editor: Slick.Editors.Number , cssClass: "cell-standard"},
		{ id: "priority", name: "prio",  field: "priority",width:25, formatter:Slick.Formatters.IncidentPriorityIcon, cssClass: "cell-standard"},
		{ id: "start", name: "start",  field: "start",width:150,formatter: Slick.Formatters.DateTime, editor: Slick.Editors.Number ,sortable:true, cssClass: "cell-standard"},
		{ id: "stop", name: "stop",  field: "stop",width:150,formatter: Slick.Formatters.DateTime, editor: Slick.Editors.Number ,sortable:true, cssClass: "cell-standard"},
    { id: "degradation", name: "deg", field: "degradation", editor: Slick.Editors.Number ,width:40, cssClass: "cell-standard"},
    { id: "revenueImpact", name: "revenueImpact", field: "revenueImpact", formatter:Slick.Formatters.EurAmount ,width:100, cssClass: "cell-standard"},
		{ id: "description", name: "description", field: "description",sortable:true,width:300, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id: "serviceName", name: "serviceName",  field: "serviceName",width:150, editor: Slick.Editors.Number , cssClass: "cell-standard"},
		{ id: "labels", name: "labels",  field: "labels",width:250, editor: Slick.Editors.Number , cssClass: "cell-standard"},
		{ id: "businessService", name: "businessService",  field: "businessService",width:150, editor: Slick.Editors.Number , cssClass: "cell-standard"},
		{ id: "resolutionTime", name: "TTR",  field: "resolutionTime",width:80, editor: Slick.Editors.Number , formatter:Slick.Formatters.ResolutionTime,sortable:true, cssClass: "cell-standard"},
		{ id: "isCoreService", name: "core",  field: "isCoreService",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "isEndUserDown", name: "end",  field: "isEndUserDown",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "isExt", name: "ext",  field: "isExt",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "extService", name: "extService",  field: "extService",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "highlight", name: "highlight",  field: "highlight",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "isIR", name: "IR",  field: "isIR",width:50, editor: Slick.Editors.Number, formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "isPlanned", name: "planned",  field: "isPlanned",width:50, editor: Slick.Editors.Number , formatter:Slick.Formatters.Checkmark, cssClass: "cell-standard"},
		{ id: "report", name: "rep",  field: "report",width:50, editor: Slick.Editors.Number, formatter:Slick.Formatters.Checkmark , cssClass: "cell-standard"}
  ];
	var _config ={};
	_config.mode="readonly";
  _config.addRow="enabled";
	_config.sortBy="start";
	_config.fields = _socoutages;
	return _config;
}


function getSOCServicesConfig(){
	var _socservices =[
    { id: "id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
    { id: "context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
		{ id: "ServiceName", name: "ServiceName",  field: "ServiceName",width:250, editor: Slick.Editors.Text , cssClass: "cell-standard"},
  	{ id: "ServiceGroupID", name: "ServiceGroupID",  field: "ServiceGroupID",width:80,editor: Slick.Editors.Text , cssClass: "cell-standard"},
  	{ id: "Report", name: "Report",  field: "Report",width:80, editor: Slick.Editors.Text, cssClass: "cell-standard"},
  	{ id: "CoreService", name: "CoreService",  field: "CoreService",width:80,   editor: Slick.Editors.Text , cssClass: "cell-standard"},
  	{ id: "Highlight", name: "Highlight",  field: "Highlight",width:80,   editor: Slick.Editors.Text , cssClass: "cell-standard"},
  	{ id: "ext_service", name: "ext_service",  field: "ext_service",width:80, editor: Slick.Editors.Text , cssClass: "cell-standard"}
  ];
	var _config ={};
	_config.mode="editable";
  _config.addRow="disabled";
	_config.fields = _socservices;
	return _config;
}

function getTeamConfig(){
		//scrumteams
	var _teams =[
    { id:"id", name: "id", field: "_id",sortable:true,width:30 ,cssClass:"onKanbanImmutable"},
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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

//scrumteams exported from V1 Teamrooms
// http://v1.bwinparty.corp/V1-Production/Default.aspx?menu=TeamRoomsPage
function getV1TeamConfig(){
	var _v1teams =[
    { id:"id", name: "id", field: "_id",sortable:true,width:30 ,cssClass:"onKanbanImmutable"},
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id:"Title", name: "Title", field: "Title",sortable:true,width:250, editor: Slick.Editors.Text,cssClass: "cell-title" },
    { id: "Business Backlog", name: "Business Backlog", field: "Business Backlog",width:200,sortable:true, editor: Slick.Editors.Text, cssClass: "cell-standard"},
		{ id: "Sprint Schedule", name: "Sprint Schedule",  field: "Sprint Schedule",editor: Slick.Editors.Text,width:150, cssClass: "cell-standard"},
		{ id: "Description", name: "Description",  field: "Description",width:400 ,sortable:true, cssClass: "cell-standard"}
  ];
 	var _config ={};
	_config.mode="editable";
	_config.fields = _v1teams;
	return _config;
}

function getV1EpicsConfig(){
		//v1 epics
	var _v1Epics =[
    { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id: "number", name: "number", field: "Number",width:50, cssClass: "cell-standard",sortable:true},
    { id: "name", name: "name", field: "Name",sortable:true,width:350,cssClass: "cell-title" },
    { id: "status", name: "status", field: "Status", width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "portfolioApproval", name: "portfolioApproval", field: "PortfolioApproval",width:50, cssClass: "cell-standard",sortable:true},
    { id: "backlog", name: "backlog",  field: "BusinessBacklog",width:150 ,sortable:true, cssClass: "cell-standard"},
    { id: "swag", name: "swag", field: "Swag", width:50, cssClass: "cell-standard",sortable:true},
    { id: "plannedStart", name: "plannedStart", field: "PlannedStart",formatter: Slick.Formatters.SimpleDate,width:100, cssClass: "cell-standard",sortable:true},
    { id: "plannedEnd", name: "plannedEnd", field: "PlannedEnd", width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard",sortable:true},
    { id: "health", name: "health", field: "Health", width:150, cssClass: "cell-title",formatter: Slick.Formatters.RAG,width:50 ,sortable:true},
    { id: "capitalizable", name: "capitalizable", field: "Capitalizable", width:20, cssClass: "cell-standard",sortable:true},
    { id: "createdBy", name: "createdBy", field: "CreatedBy", width:150, cssClass: "cell-standard",sortable:true},
    { id: "changedBy", name: "changedBy", field: "ChangedBy", width:150, cssClass: "cell-standard",sortable:true},
    { id: "categoryName", name: "categoryName", field: "CategoryName",width:150, cssClass: "cell-standard",sortable:true},
    { id: "value", name: "Value", field: "value",width:30, cssClass: "cell-standard",sortable:true},
    { id: "risk", name: "Risk", field: "risk",width:30, cssClass: "cell-standard",sortable:true},
    { id: "healthComment", name: "healthComment", field: "HealthComment" ,width:150, cssClass: "cell-standard",sortable:true},
    { id: "description", name: "description", field: "Description",width:150, cssClass: "cell-standard",sortable:true},
    { id: "attachments", name: "attachements", field: "EpicAttachments",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "strategicThemes", name: "strategicThemes", field: "StrategicThemesNames",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "initiativeOwner", name: "initiativeOwner", field: "InitiativeOwner",width:200, cssClass: "cell-standard",sortable:true},
		{ id: "elevatorPitch", name: "elevatorPitch", field: "ElevatorPitch",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "launchDateWhy", name: "launchDateWhy", field: "LaunchDateWhy",width:300, cssClass: "cell-standard",sortable:true}
		];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _v1Epics;
	return _config;
}

function getRoadmapInitiativesConfig(){
		//v1 epics
	var _roadmapinitiatives =[
    { id:"id", name: "id", field: "_id",sortable:true,width:20,cssClass:"onKanbanImmutable"},
    { id: "number", name: "number", field: "Number",width:50, cssClass: "cell-standard",sortable:true},
    { id: "name", name: "name", field: "Name",sortable:true,width:350,cssClass: "cell-title" },
    { id: "backlog", name: "backlog",  field: "BusinessBacklog",width:150 ,sortable:true, cssClass: "cell-standard"},
    { id: "product", name: "product",  field: "Product",width:150 ,sortable:true, cssClass: "cell-standard"},
    { id: "plannedStart", name: "plannedStart", field: "PlannedStart",formatter: Slick.Formatters.SimpleDate,width:100, cssClass: "cell-standard",sortable:true},
    { id: "plannedEnd", name: "plannedEnd", field: "PlannedEnd", width:100,formatter: Slick.Formatters.SimpleDate, cssClass: "cell-standard",sortable:true},
    { id: "status", name: "status", field: "Status", width:150 ,sortable:true, cssClass: "cell-standard"},
    { id: "value", name: "Value", field: "value",width:30, cssClass: "cell-standard",sortable:true},
    { id: "risk", name: "Risk", field: "risk",width:30, cssClass: "cell-standard",sortable:true},
		{ id: "initiativeOwner", name: "initiativeOwner", field: "InitiativeOwner",width:200, cssClass: "cell-standard",sortable:true},

		{ id: "targets", name: "targets", field: "Targets",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "markets", name: "markets", field: "Markets",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "customers", name: "customers", field: "Customers",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "portfolioApproval", name: "portfolioApproval", field: "PortfolioApproval",width:50, cssClass: "cell-standard",sortable:true},
    { id: "swag", name: "swag", field: "Swag", width:50, cssClass: "cell-standard",sortable:true},
    { id: "health", name: "health", field: "Health", width:150, cssClass: "cell-title",formatter: Slick.Formatters.RAG,width:50 ,sortable:true},
		{ id: "elevatorPitch", name: "elevatorPitch", field: "ElevatorPitch",width:300, cssClass: "cell-standard",sortable:true},
		{ id: "launchDateWhy", name: "launchDateWhy", field: "LaunchDateWhy",width:300, cssClass: "cell-standard",sortable:true}
		];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _roadmapinitiatives;
	return _config;
}


function getIncidentsConfig(){
	var _incidents =[
    { id:"id", name: "id", field: "id",sortable:true,width:70,formatter:Slick.Formatters.IncidentDetailURL,cssClass:"onKanbanImmutable" },
  	{ id:"sysId", name: "sysId", field: "sysId",sortable:true,width:70,formatter:Slick.Formatters.SnowIncidentURL,cssClass:"onKanbanImmutable" },
		//{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
		{ id:"priority", name: "prio", field: "priority",sortable:true,width:25,  formatter:Slick.Formatters.IncidentPriorityIcon,cssClass: "cell-standard" },
    { id:"state", name: "state", field: "state",sortable:true,width:70, formatter:Slick.Formatters.IncidentPriority,cssClass: "cell-standard" },
    { id:"state", name: "s", field: "state",sortable:true,width:20, formatter:Slick.Formatters.IncidentState,cssClass: "cell-standard" },
    { id:"active", name: "active", field: "active",sortable:true,width:50, editor: Slick.Editors.Text,cssClass: "cell-standard" },
	  { id:"openedAt", name: "openedAt", field: "openedAt", formatter:Slick.Formatters.DateTime ,width:120, cssClass: "cell-standard",sortable:true},
    { id:"shortDescription", name: "shortDescription",  field: "shortDescription",width:300 ,formatter:Slick.Formatters.IncidentPriority,sortable:true, cssClass: "cell-standard"},
    { id:"slaResolutionDate", name: "SLA Date", field: "slaResolutionDate",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"resolvedAt", name: "resolvedAt", field: "resolvedAt",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"closedAt", name: "closedAt", field: "closedAt",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"closeCode", name: "closeCode", field: "closeCode",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"timeToResolve", name: "TTR", field: "timeToResolve",sortable:true,width:80, formatter:Slick.Formatters.ResolutionTime,cssClass: "cell-standard" },
		{ id:"revenueImpact", name: "revenueImpact", field: "revenueImpact",sortable:true,width:80, formatter:Slick.Formatters.EurAmount,cssClass: "cell-standard" },
		{ id:"slaBreach", name: "SLA Breach", field: "slaBreach",sortable:true,width:80, formatter:Slick.Formatters.IncidentSLABreach,cssClass: "cell-standard" },
		{ id:"slaBreachTime", name: "Breach by", field: "slaBreachTime",sortable:true,width:80, editor: Slick.Editors.Text,cssClass: "cell-standard-red" },
		{ id:"businessService", name: "businessService", field: "businessService",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"category", name: "category", field: "category",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"subCategory", name: "subCategory", field: "subCategory",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"location", name: "location", field: "location",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"label", name: "label", field: "label",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"assignmentGroup", name: "assignmentGroup", field: "assignmentGroup",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"environment", name: "environment", field: "environment",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"impact", name: "impact", field: "impact",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"urgency", name: "urgency", field: "urgency",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"description", name: "description", field: "description",sortable:true,width:500, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"labelType", name: "labelType", field: "labelType",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id: "problemId", name: "problemId",  field: "problemId",width:80 ,sortable:true, cssClass: "cell-standard"},
		{ id: "severity", name: "severity",  field: "severity",width:80 ,sortable:true, cssClass: "cell-standard"},
		{ id: "isMajorIncident", name: "isMajorIncident",  field: "isMajorIncident",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "createdBy", name: "createdBy",  field: "createdBy",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "contactType", name: "contactType",  field: "contactType",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "timeWorked", name: "timeWorked",  field: "timeWorked",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "syncDate", name: "syncDate",  field: "shortDescription",width:150 ,sortable:true, cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _incidents;
	return _config;
}


function getIncidentsOldSnowConfig(){
	var _incidents =[
    { id:"id", name: "id", field: "id",sortable:true,width:70,formatter:Slick.Formatters.IncidentDetailURL,cssClass:"onKanbanImmutable" },
  	{ id:"sysId", name: "sysId", field: "sysId",sortable:true,width:70,formatter:Slick.Formatters.SnowIncidentURL,cssClass:"onKanbanImmutable" },
		//{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
		{ id:"priority", name: "prio", field: "priority",sortable:true,width:25,  formatter:Slick.Formatters.IncidentPriorityIcon,cssClass: "cell-standard" },
    { id:"state", name: "state", field: "state",sortable:true,width:70, formatter:Slick.Formatters.IncidentPriority,cssClass: "cell-standard" },
    { id:"state", name: "s", field: "state",sortable:true,width:20, formatter:Slick.Formatters.IncidentState,cssClass: "cell-standard" },
    { id:"active", name: "active", field: "active",sortable:true,width:50, editor: Slick.Editors.Text,cssClass: "cell-standard" },
	  { id:"openedAt", name: "openedAt", field: "openedAt", formatter:Slick.Formatters.DateTime ,width:120, cssClass: "cell-standard",sortable:true},
    { id:"shortDescription", name: "shortDescription",  field: "shortDescription",width:300 ,formatter:Slick.Formatters.IncidentPriority,sortable:true, cssClass: "cell-standard"},
    { id:"slaResolutionDate", name: "SLA Date", field: "slaResolutionDate",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"resolvedAt", name: "resolvedAt", field: "resolvedAt",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"closedAt", name: "closedAt", field: "closedAt",sortable:true,width:120, formatter:Slick.Formatters.DateTime,cssClass: "cell-standard" },
    { id:"closeCode", name: "closeCode", field: "closeCode",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"timeToResolve", name: "TTR", field: "timeToResolve",sortable:true,width:80, formatter:Slick.Formatters.ResolutionTime,cssClass: "cell-standard" },
		{ id:"revenueImpact", name: "revenueImpact", field: "revenueImpact",sortable:true,width:80, formatter:Slick.Formatters.EurAmount,cssClass: "cell-standard" },
		{ id:"slaBreach", name: "SLA Breach", field: "slaBreach",sortable:true,width:80, formatter:Slick.Formatters.IncidentSLABreach,cssClass: "cell-standard" },
		{ id:"slaBreachTime", name: "Breach by", field: "slaBreachTime",sortable:true,width:80, editor: Slick.Editors.Text,cssClass: "cell-standard-red" },
		{ id:"businessService", name: "businessService", field: "businessService",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"category", name: "category", field: "category",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"subCategory", name: "subCategory", field: "subCategory",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"location", name: "location", field: "location",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"label", name: "label", field: "label",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"assignmentGroup", name: "assignmentGroup", field: "assignmentGroup",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"environment", name: "environment", field: "environment",sortable:true,width:200, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"impact", name: "impact", field: "impact",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"urgency", name: "urgency", field: "urgency",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"description", name: "description", field: "description",sortable:true,width:500, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"labelType", name: "labelType", field: "labelType",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id: "problemId", name: "problemId",  field: "problemId",width:80 ,sortable:true, cssClass: "cell-standard"},
		{ id: "severity", name: "severity",  field: "severity",width:80 ,sortable:true, cssClass: "cell-standard"},
		{ id: "isMajorIncident", name: "isMajorIncident",  field: "isMajorIncident",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "createdBy", name: "createdBy",  field: "createdBy",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "contactType", name: "contactType",  field: "contactType",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "timeWorked", name: "timeWorked",  field: "timeWorked",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "syncDate", name: "syncDate",  field: "shortDescription",width:150 ,sortable:true, cssClass: "cell-standard"}];
	var _config ={};
	_config.fields = _incidents;
	return _config;
}

function getProblemsConfig(){
	var _problems =[
    { id:"id", name: "id", field: "id",sortable:true,width:70,cssClass:"onKanbanImmutable" },
  	{ id:"sysId", name: "sysId", field: "sysId",sortable:true,width:70,cssClass:"onKanbanImmutable" },
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    { id: "openedAt", name: "openedAt", field: "openedAt", formatter:Slick.Formatters.DateTime, editor: Slick.Editors.Text ,width:150, cssClass: "cell-standard",sortable:true},
    { id:"impact", name: "impact", field: "impact",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"urgency", name: "urgency", field: "urgency",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id: "shortDescription", name: "shortDescription",  field: "shortDescription",width:250 ,sortable:true, cssClass: "cell-standard"},
		{ id:"priority", name: "priority", field: "priority",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id:"label", name: "label", field: "label",sortable:true,width:100, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"closedAt", name: "closedAt", field: "closedAt", formatter:Slick.Formatters.DateTime,sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"labelType", name: "labelType", field: "labelType",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"active", name: "active", field: "active",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"closeCode", name: "closeCode", field: "closeCode",sortable:true,width:150, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id:"state", name: "state", field: "state",sortable:true,width:80, editor: Slick.Editors.Text,cssClass: "cell-standard" },
		{ id: "incidentId", name: "incidentId",  field: "incidentId",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id:"description", name: "description", field: "description",sortable:true,width:500, editor: Slick.Editors.Text,cssClass: "cell-standard" },
    { id: "createdBy", name: "createdBy",  field: "createdBy",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "contactType", name: "contactType",  field: "contactType",width:150 ,sortable:true, cssClass: "cell-standard"},
		{ id: "syncDate", name: "syncDate",  field: "syncDate",width:150 ,sortable:true, cssClass: "cell-standard"}];
	var _config ={};
	_config.mode="editable";
	_config.fields = _problems;
	return _config;
}

function getLabelsConfig(){
	var _labels =[
    { id:"id", name: "id", field: "_id",sortable:true,width:30,cssClass:"onKanbanImmutable" },
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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
  	{ id: "context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
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

function getOrganizationConfig(){
	var _organization =[
    { id: "id", name: "id", field: "_id",sortable:true,width:30,cssClass:"onKanbanImmutable" },
  	{ id:"context", name: "context", field: "context",sortable:true,width:80,cssClass:"onKanbanImmutable"},
    {id: "Employee Number", name:"Employee Number" , field: "Employee Number", editor: Slick.Editors.Text ,width:50,sortable:true, cssClass: "cell-standard"},
		//{id: "Full Name", name:"Full Name" , field: "Full Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Last Name", name:"Last Name" , field: "Last Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "First Name", name:"First Name" , field: "First Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		//{id: "Title", name:"Title" , field: "Title", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Gender", name:"Gender" , field: "Gender", editor: Slick.Editors.Text ,width:50,sortable:true, cssClass: "cell-standard"},
		{id: "Email Address", name:"Email Address" , field: "Email Address", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Contract Type", name:"Contract Type" , field: "Contract Type", editor: Slick.Editors.Text ,width:80,sortable:true, cssClass: "cell-standard"},
		{id: "Person Type", name:"Person Type" , field: "Person Type", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Assignment Category", name:"Assignment Category" , field: "Assignment Category", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Job", name:"Job" , field: "Job", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Corporate Job Title", name:"Corporate Job Title" , field: "Corporate Job Title", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Local Job Title", name:"Local Job Title" , field: "Local Job Title", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Contractual Job Title", name:"Contractual Job Title" , field: "Contractual Job Title", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Position", name:"Position" , field: "Position", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Function", name:"Function" , field: "Function", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Vertical", name:"Vertical" , field: "Vertical", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Location", name:"Location" , field: "Location", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Employing Legal Entity", name:"Employing Legal Entity" , field: "Employing Legal Entity", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Organization", name:"Organization" , field: "Organization", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Organization Type", name:"Organization Type" , field: "Organization Type", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Employee is a Supervisor?", name:"Employee is a Supervisor?" , field: "Employee is a Supervisor?", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Cost Centre", name:"Cost Centre" , field: "Cost Centre", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Assignment Cost Code", name:"Assignment Cost Code" , field: "Assignment Cost Code", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Supervisor Employee Number", name:"Supervisor Employee Number" , field: "Supervisor Employee Number", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Supervisor Full Name", name:"Supervisor Full Name" , field: "Supervisor Full Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Supervisor E-Mail", name:"Supervisor E-Mail" , field: "Supervisor E-Mail", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "HRBP Employee Number", name:"HRBP Employee Number" , field: "HRBP Employee Number", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "HRBP Full Name", name:"HRBP Full Name" , field: "HRBP Full Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Scrum Master Number", name:"Scrum Master Number" , field: "Scrum Master Number", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Scrum Master Name", name:"Scrum Master Name" , field: "Scrum Master Name", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Scrum Team 1", name:"Scrum Team 1" , field: "Scrum Team 1", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Scrum Team 2", name:"Scrum Team 2" , field: "Scrum Team 2", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Scrum Team 3", name:"Scrum Team 3" , field: "Scrum Team 3", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Date First Hired", name:"Date First Hired" , field: "Date First Hired", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Projected Termination Date", name:"Projected Termination Date" , field: "Projected Termination Date", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"},
		{id: "Actual Termination Date", name:"Actual Termination Date" , field: "Actual Termination Date", editor: Slick.Editors.Text ,width:150,sortable:true, cssClass: "cell-standard"}
	];
	var _config ={};
	_config.mode="readonly";
	_config.fields = _organization;
	return _config;
}
