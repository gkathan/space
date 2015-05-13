/**
 * excel exporter
 *
 * .....
 */


var config = require('config');
var nodeExcel = require('excel-export');

var mongojs = require('mongojs');

var _ = require('lodash');
var moment = require('moment');

var DB=config.database.db;
var HOST = config.database.host;
var connection_string = HOST+'/'+DB;
var db = mongojs(connection_string, [DB]);


var winston=require('winston');
var logger = winston.loggers.get('space_log');

exports.excelTargets = excelTargets;
exports.excelRoadmaps = excelRoadmaps;
exports.excelMetrics = excelMetrics;
exports.excelBoards = excelBoards;
exports.excelV1Epics = excelV1Epics;
exports.excelProductCatalog = excelProductCatalog;
exports.excelScrumTeams = excelScrumTeams;
exports.excelFirereport = excelFirereport;
exports.excelV1Teams = excelV1Teams;
exports.excelIncidenttracker = excelIncidenttracker;
exports.excelIncidents = excelIncidents;
exports.excelProblems= excelProblems;
exports.excelContent = excelContent;
exports.excelLabels = excelLabels;
exports.excelDomains = excelDomains;
exports.excelOrganization = excelOrganization;
exports.excelAvailability = excelAvailability;
exports.excelCustomers = excelCustomers;
exports.excelCompetitors = excelCompetitors;
exports.excelInitiatives = excelInitiatives;
exports.excelSOCIncidents = excelSOCIncidents;



/**
 * generate targets excel
 */
function excelTargets(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'profit',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'rag',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'vision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'cluster',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'theme',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'group',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'icon',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'icon_theme',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dashboardTop',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dashboardDetail',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'target',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directMetric',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directMetricScale',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directTarget',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'directTime',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'outcome',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'baseline',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'measure',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'by when',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'link',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'owner',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'responsible',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'comments',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contributors',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sponsor',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'start',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'end',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("targets",conf,req,res,next);
}

/**
 * generate targets excel
 */
function excelRoadmaps(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'area',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'endDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'version',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:30,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("roadmaps",conf,req,res,next);
}


/**
 * generate metrics excel
 */
function excelMetrics(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dimension',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'class',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'intervalStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'intervalEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'forecastDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'number',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'scale',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sustainable',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'reforecast',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'targets',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'direction',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("metrics",conf,req,res,next);
}

/**
 * generate boards excel
 */
function excelBoards(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'sring',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'vision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'subvision',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'mission',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'height',type:'number',width:4,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'width',type:'number',width:4,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'itemScale',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'itemFontScale',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'laneboxRightWidth',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'endDate',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'WIPWindowDays',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("boards",conf,req,res,next);
}

/**
 * generate boards excel
 */
function excelV1Epics(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Number',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Name',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Status',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scope',type:'string',width:25,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Swag',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'PlannedEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'PlannedStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Health',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Capitalizable',type:'string',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'CreatedBy',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ChangedBy',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'CategoryName',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Risk',type:'number',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Value',type:'number',width:3,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HealthComment',type:'string',width:2,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}


	];
	conf._field="epics";

    _generateAndSendExcel("v1epics",conf,req,res,next);
}

/**
 * generate productcatalog excel
 */
function excelProductCatalog(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Type',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Offering',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Family',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Name',type:'string',width:25,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'number',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Version',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Owner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Comments',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DependsOn',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ConsumedBy',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("productcatalog",conf,req,res,next);
}

/**
 * generate scrumteams excel
 */
function excelScrumTeams(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Teamname',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Location',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Vertical',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Product',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'SubProduct',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ProductOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'APO',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'WorkingMode',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'TeamCreateDate',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Kkills',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Technologies',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scope',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Teamsize',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Podmaster',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'IsCrosscomponent',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Self-formation?',type:'string',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
   _generateAndSendExcel("scrumteams",conf,req,res,next);
}


/**
 * generate scrumteams excel
 */
function excelFirereport(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'path',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'year',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'count',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contact',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
   _generateAndSendExcel("firereports",conf,req,res,next);
}

/**
 * generate scrumteams excel
 */
function excelV1Teams(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Business Backlog',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Program',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Description',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Mascot',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Sprint Schedule',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("v1teams",conf,req,res,next);
}


/**
 * generate scrumteams excel
 */
function excelIncidenttracker(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'P1',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'P8',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("incidenttracker",conf,req,res,next);
}

/**
 * generate scrumteams excel
 */
function excelContent(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'headline',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'content',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'date',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("content",conf,req,res,next);
}


/**
 * generate labels excel
 */
function excelLabels(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'market',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'brand',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'label',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("labels",conf,req,res,next);
}


/**
 * generate domains excel
 */
function excelDomains(req, res , next){
	console.log("******************* domain excel export");
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'domainName',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'aRecords',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpLogStatus',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpLogRedirect',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'httpsLogStatus',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("domains",conf,req,res,next);
}

/**
 * generate organization excel
 */
function excelOrganization(req, res , next){
	console.log("******************* organization excel export");
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Last Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'First Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Gender',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Email Address',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Contract Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Person Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Assignment Category',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Job',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Corporate Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Local Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Contractual Job Title',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Position',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Function',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Vertical',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Location',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employing Legal Entity',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Organization',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Organization Type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Employee is a Supervisor?',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Cost Centre',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Assignment Cost Code',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor Full Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Supervisor E-Mail',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HRBP Employee Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'HRBP Full Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master Number',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Master Name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 1',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 2',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Scrum Team 3',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Date First Hired',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Projected Termination Date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Actual Termination Date',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("organization",conf,req,res,next);
}


/**
 * generate availability excel
 */
function excelAvailability(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'year',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'week',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'unplannedYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'plannedYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'totalYTD',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("availability",conf,req,res,next);
}


/**
 * generate customers excel
 */
function excelCustomers(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'scope',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'market',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contact',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'key accounter',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("customers",conf,req,res,next);
}



/**
 * generate competitors excel
 */
function excelCompetitors(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'offer',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'type',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'marketcap',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stock',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stocklink',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'products',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'markets',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("competitors",conf,req,res,next);
}


/**
 * generates initiatives excel
 */
function excelInitiatives(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
 		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'context',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ExtId',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'ExtNumber',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'name2',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isCorporate',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'onKanban',type:'string',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'backlog',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'bm',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'theme',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'lane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'themesl',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sublane',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sublaneOffset',type:'number',width:7,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'startDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'planDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'actualDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1plannedStart',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1plannedEnd',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'v1launchDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'state',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'health',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'healthComment',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'progress',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'status',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'size',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Type',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'cost',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'Swag',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'benefit',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'dependsOn',type:'string',width:8,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'accuracy',type:'number',width:5,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'productOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'businessOwner',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'programLead',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DoD',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'DoR',type:'string',width:15,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'createDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'changeDate',type:'string',width:10,captionStyleIndex:2,beforeCellWrite:_formatCell}
   ];
    _generateAndSendExcel("initiatives",conf,req,res,next);
}

/**
 * generate customers excel
 */
function excelSOCIncidents(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'priority',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'incidentID',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'degradation',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'start',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stop',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'serviceName',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'resolutionTime',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'report',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'extService',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isExt',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isIR',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isPlanned',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'highlight',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isCoreService',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isEndUserDown',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'highlight',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("socincidents",conf,req,res,next);
}



/**
 * generate customers excel
 */
function excelIncidents(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'id',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'sysId',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'priority',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'state',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'openedAt',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'shortDescription',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'slaResolutionDate',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'resolvedAt',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'closedAt',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'timeToResolve',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'closeCode',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'revenueImpact',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'slaBreach',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'slaBreachTime',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'businessService',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'category',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'subCategory',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'location',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'label',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'assignmentGroup',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'environment',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'impact',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'urgency',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'labelType',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'active',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'problemId',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'severity',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isMajorIncident',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'createdBy',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'contactType',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'timeWorked',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'syncDate',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("incidents",conf,req,res,next);
}
/**
 * generate customers excel
 */
function excelProblems(req, res , next){
	var conf ={};
    conf.stylesXmlFile = "views/excel_export/styles.xml";
    conf.cols = [
		{caption:'_id',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'priority',type:'string',width:12,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'incidentID',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'description',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'degradation',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'start',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'stop',type:'string',width:50,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'serviceName',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'resolutionTime',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'report',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'extService',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isExt',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isIR',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isPlanned',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'highlight',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isCoreService',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'isEndUserDown',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'highlight',type:'string',width:20,captionStyleIndex:2,beforeCellWrite:_formatCell},
		{caption:'url',type:'string',width:40,captionStyleIndex:2,beforeCellWrite:_formatCell}
	];
    _generateAndSendExcel("problems",conf,req,res,next);
}



function _generateAndSendExcel(collection,conf,req,res,next){
	db.collection(collection).find().sort({_id : 1} , function(err , success){
		if(success){

			if (collection=="domains"){
				success = _transformDomains(success);
			}

			if (conf._field){
				conf.rows = _createDataRows(conf,success[0][conf._field]);
			}
			else {
				conf.rows = _createDataRows(conf,success);
			}
			var _now = moment().format("YYYYMMDD");

			var result = nodeExcel.execute(conf);
			res.set('Content-Type', 'application/vnd.openxmlformats');
			res.set("Content-Disposition", "attachment; filename=s p a c e_export_" + collection+"_"+_now+".xlsx");
			res.end(result, 'binary');
		}
    });
}



function _stripCrap(object){
	if (typeof object =="string"){
		//strip out all HTML tags - http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
		object = object.replace(/(<([^>]+)>)/ig,"");
		object = object.replace(/[^ -~]/g, "");

		//object = object.replace(/(\r\n|\n|\r)/gm,"");
		/*object = object.replace(/(\u001c)/g, "");
		object = object.replace(/(\u001a)/g, "");
		object = object.replace(/(\u001b)/g, "");
		object = object.replace(/(\u001e)/g, "");
		object = object.replace(/(\u001f)/g, "");
		object = object.replace(/(\u0013)/g, "");
		*/
	}
	return object;
}


/** row formatting
 *
 */
function _formatCell(row, cellData,eOpt){
  if (eOpt.rowNum%2 ===0)
		eOpt.styleIndex=1;
	else
		eOpt.styleIndex=3;
 	return _stripCrap(cellData);
}

/**
 * extracts the captions from a conf arrax
 * needed for deterministically create the data for CSV export
 */
function _getCaptionArray(conf){
   var _fields = [];

   for (var c in conf.cols){
	   _fields.push(conf.cols[c].caption);
   }

   return _fields;
}

/**
 * builds array of values for excel export
 */
function _createDataRows(conf,data){
	var _fields = _getCaptionArray(conf);
	var _list = [];

	for (var d in data){
		var _row = [];
		//logger.debug("JSON: "+JSON.stringify(data[d]));
		for (var f in _fields){
			var _column = _fields[f];
			//logger.debug("+ column: "+_column+ "... data: "+data[d][_column]);
			if (! data[d][_column]) _row.push("");
			else _row.push(data[d][_column]);
		}
		_list.push(_row);
		//logger.debug("** row: "+_row);
	}
	return _list;
}
