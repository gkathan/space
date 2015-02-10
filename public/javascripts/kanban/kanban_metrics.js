/** NG version (2.0) based on node.js express and new data structures 
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.github.com/gkathan/kanban
 */

var metricData;

// metric dates
var METRIC_CONTEXT;

//name of metric view (default)
//var METRIC_VIEW="REVIEW_Q1_2014";
var METRIC_VIEW="FORECAST_2015";


// y coord of marker / dates 
//var MARKER_DATE_TOP = -20;

//width of a metric column
var METRIC_WIDTH=150;

// 
var METRIC_BASE_Y = -220;
var METRIC_PIE_BASE_Y = METRIC_BASE_Y+75;
var METRIC_CX_BASE_Y = METRIC_BASE_Y+50;
var METRIC_SHARE_BASE_Y = METRIC_BASE_Y+35;

var METRIC_BASE_X_OFFSET = LANE_LABELBOX_LEFT_WIDTH +120;
var Y_CORP_METRICS=-30;


//bracket y offset
var METRIC_BRACKET_Y_OFFSET = 25;

// width of the targets block after KANBAN_END and before LANELABELBOX_RIGHT
var TARGETS_COL_WIDTH=10;


var METRICS_SCALE=1;


//config of metrics

/* 
 forecastDate:
 * list of forecast calculation dates, historical => e.g. initial forecast was calculated on 2013-10-31, first reforecast was done on 2014-03-11, ....")
 */


// ============== YEAR 2014/2015 FORECAST ====================
var METRIC_CONTEXT_CONFIG=[{"view":"FORECAST_2015","context":[
					{"column":"left","dimension": "actual", "intervalStart":"2013-01-01","intervalEnd":"2013-12-31","comparison":"","data": {"title":"RESULT 2013" ,"line1":"","line2":""}},
					{"column":"right1","dimension": "forecast", "intervalStart":"2014-01-01","intervalEnd":"2014-12-31","comparison":"forecast","forecastDate":["2013-10-31","2014-03-11"],"data": {"title":"FORECAST 2014" ,"line1":"","line2":"forecast from"}},
					{"column":"right2","dimension": "forecast", "intervalStart":"2015-01-01","intervalEnd":"2015-12-31","comparison":"forecast","forecastDate":["2013-10-31","2014-03-11"],"data": {"title":"FORECAST 2015" ,"line1":"","line2":"forecast from"}},
					{"column":"right3","dimension": "goal", "intervalStart":"2015-01-01","intervalEnd":"2015-12-31","comparison":"","data": {"title":"GOAL" ,"line1":"norbert says","line2":"forecast from"}},
					{"column":"top","dimension": "forecast", "intervalStart":"2015-01-01","intervalEnd":"2015-12-31","comparison":"","data": {"title":"POTENTIALS" ,"line1":"risks & opportunities"}}
					]},


		{"view":"REVIEW_Q1_2014","context":[
					{"column":"left","dimension": "actual", "intervalStart":"2013-01-01","intervalEnd":"2013-03-31","comparison":"", "data": {"title":"RESULTS Q1-2013" ,"line1":"","line2":""}},
					{"column":"right1","dimension": "actual", "intervalStart":"2014-01-01","intervalEnd":"2014-03-31","comparison":"forecast","forecastDate":["2013-10-31"],"data": {"title":"REVIEW Q1-2014" ,"line1":"actuals","line2":"compared to forecast from"}},
					{"column":"top","dimension": "forecast", "intervalStart":"2015-01-01","intervalEnd":"2015-12-31","comparison":"","data": {"title":"POTENTIALS" ,"line1":"risks & opportunities"}}
		]}];

//default context		
METRIC_CONTEXT = _getDataBy("view",METRIC_VIEW,METRIC_CONTEXT_CONFIG).context;

function _setMetricContext(context){
	METRIC_CONTEXT = _getDataBy("view",context,METRIC_CONTEXT_CONFIG).context; 
	METRIC_VIEW = context;
}


//METRIC_CONTEXT = METRIC_CONTEXT_REVIEW_Q1_2014;
		

var SHOW_METRICS = false;

// columns => change needs a drawAll()
var SHOW_METRICS_BASELINE;
var SHOW_METRICS_FORECAST1;
var SHOW_METRICS_FORECAST2;
var SHOW_METRICS_GOAL;

//just hide show layers 
var SHOW_METRICS_POTENTIALS=false;
var SHOW_METRICS_CORPORATE;
var SHOW_METRICS_NGR;


/** TODO refactor whole metric show/hide mess !!!
   => d3.select("svg").attr("width",WIDTH-150)
   * with that it is easy to change the svg canvas size
   * therefore no need to redraw() when i e.g. remove metric columns
   * pure translate handling of columns 

move potentials to new place ...
	d3.select("#metrics_potentials").transition().duration(300).attr("transform","translate(-10,-260) scale(.6)")
*/

// ----------------------------------------------------------------------------------------------------------------
// -------------------------------------------- METRICS SECTION ---------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

function drawMetrics(){
	d3.select("#metrics").remove();
	var i=0;
	var gMetrics= svg.append("g").attr("id","metrics");
	// y space between KPIs
	var _kpiYOffset = 15;
	var _yTotal = Y_CORP_METRICS;
	//left			
	var _primaryXOffset = METRIC_BASE_X_OFFSET-60;
	var _secondaryXOffset = METRIC_BASE_X_OFFSET-85;
	//right
	var _metricXBaseRight= TARGETS_COL_WIDTH+LANE_LABELBOX_RIGHT_WIDTH;
	var _primaryXOffsetRight = _metricXBaseRight +120;
	var _secondaryXOffsetRight = _metricXBaseRight+30;
	// all KPIs & results in baseline
	var _baselineResultSum=0;
	var _targetResultSum1=0;
	var _targetResultSum2=0;
	var _primTextYOffset=18; 

// -------------------------- baseline -----------------------------------------------
	var gMetricsBaseline = gMetrics.append("g").attr("id","metrics_left");
	_baselineResultSum = _renderMetrics(gMetricsBaseline,"left",(x(KANBAN_START)-_primaryXOffset),(x(KANBAN_START)-_secondaryXOffset),METRICS_SCALE);
	

	var _offset = 70;
// -------------------------- forecast 1-year (2014) -------------------------------
		
		if (_getMetricContextByColumn("right1")){
			// !!! forecast is always for ONE target date = e.g. forecast for 2014
			// forecast can be re-forecasted multiple times - and it is essential to show the history and deltas between each reforecast 
			var gMetricsForecast1 = gMetrics.append("g").attr("id","metrics_forecast1");
			_targetResultSum1 = _renderMetrics(gMetricsForecast1,"right1",x(KANBAN_END)+_primaryXOffsetRight-_offset,x(KANBAN_END)+_secondaryXOffsetRight,METRICS_SCALE);
			
			if (SHOW_METRICS_FORECAST2)
				d3.select("#metrics_right1").style("opacity",0.5);
			
			_primaryXOffsetRight += METRIC_WIDTH;
			_secondaryXOffsetRight += METRIC_WIDTH;

			_drawMetricSeparator(gMetrics,x(KANBAN_END)+_secondaryXOffsetRight-35);
		}
		
// -------------------------- forecast 2-years (2015)-------------------------------
		if (_getMetricContextByColumn("right2")){
		
			var gMetricsForecast2 = gMetrics.append("g").attr("id","metrics_forecast2");
			_targetResultSum2 = _renderMetrics(gMetricsForecast2,"right2",x(KANBAN_END)+_primaryXOffsetRight-_offset,x(KANBAN_END)+_secondaryXOffsetRight,METRICS_SCALE);

			_primaryXOffsetRight += METRIC_WIDTH;
			_secondaryXOffsetRight += METRIC_WIDTH;

		}

		
		var _context;

// ------------------------------ potentials ------------------------------------------------
		
		if (_getMetricContextByColumn("top")){
			_context = _getMetricContextByColumn("top");
			
			_primaryXOffsetRight-=120;

			var gMetricsPotential = gMetrics.append("g").attr("id","metrics_potentials");
			var _yRisk = -185;
			var _xRisk = x(KANBAN_END)+30//-150;//-_primaryXOffsetRight;

			// ----------------------------------------- risks ------------------------------------------------
			_drawPotentials(gMetricsPotential,"risk",_context,_xRisk,_yRisk,0.7);
			// ----------------------------------------- opportunities -----------------------------------------
			_drawPotentials(gMetricsPotential,"opportunity",_context,_xRisk+80,_yRisk,0.7);
		}

	// ------------------------------------- goal column ------- ------------------------------------
		if (_getMetricContextByColumn("right3")){
			var _context = _getMetricContextByColumn("right3");
			//var _forecastDateG = _.last(_context.data.forecastDate);


			var gMetricsGoal = gMetrics.append("g").attr("id","metrics_goal");
			
			_drawMetricDate(gMetricsGoal,x(KANBAN_END)+_primaryXOffsetRight,METRIC_BASE_Y,_getDataBy("dimension","goal",METRIC_CONTEXT));
			
			 var _goalResult = metricData.filter(function(d){return d.class=="result" && d.dimension=="goal" });
			_drawTextMetric(gMetricsGoal,_goalResult[0],"metricBig",x(KANBAN_END)+_primaryXOffsetRight+30,_yTotal,10,"left",METRICS_SCALE,_context);

			var _goalKpis = metricData.filter(function(d){return  d.class=="kpi" && d.dimension=="goal"});
			var _yTotalKpiBase = _yTotal-10;
			for (var k in _goalKpis){
				_drawTextMetric(gMetricsGoal,_goalKpis[k],"metricSmall",x(KANBAN_END)+_primaryXOffsetRight+30,_yTotalKpiBase-(((getInt(k)+1)*15)*METRICS_SCALE),6,"right",METRICS_SCALE,_context);
			}
			
			//delta symbol
			_drawXlink(gMetricsGoal,"#icon_delta",(x(KANBAN_END)+_primaryXOffsetRight-36),(_yTotal+18),{"scale":0.4});

			_drawBracket(gMetricsGoal,"blue","bottom",x(KANBAN_END)+_primaryXOffsetRight-85,_yTotal+7,1.1,.8,"bracket",0.1);
			
			var _diff = _goalResult[0].number-_targetResultSum2;
			var _delta = {"number":"= "+_diff ,"scale":"mio EUR" ,"type":"missing", "sustainable":-1 };

			_drawTextMetric(gMetricsGoal,_delta,"metricBig",x(KANBAN_END)+_primaryXOffsetRight+30,_yTotal+(28*METRICS_SCALE),10,"left",METRICS_SCALE,_context);
		
		}


	//------------------------------------- linechart prototype ------------------------------------
	drawLineChart();
	
	// based on SHOW_ flags hide or show certain metric columns / rows
	filterMetrics();

} //end drawMetrics


/** risks and opportunitis from metricData
 */
//function _drawPotentials(svg,dimension,type,forecastDate,xBase,yBase,scale,context){
function _drawPotentials(svg,type,context,xBase,yBase,scale){
	var _ySign;
	if(!scale) scale=METRICS_SCALE;
	
	var _data= metricData.filter(function(d){return (d.dimension==context.dimension) && (d.class==type) });
	
	for (var i in _data){
		console.log("context:"+context.comparison);
		 _drawTextMetric(svg,_data[i],"metricSmall",xBase,yBase+((i*20)*scale),10,"left",1,context);
	}
	_ySign = yBase-(65*scale);
	_drawXlink(svg,"#"+type,(xBase-20),_ySign,{"scale":scale});
}



/** convenience method ;-)**/
function _getMetricContextByColumn(column){
	return _getDataBy("column",column,METRIC_CONTEXT);
}


/**
 * @dimension "baseline,forecast1,forecast2"
 * 
 */
function _renderMetrics(svg,column,x1Base,x2Base,scale){
	// y space between KPIs
	var _kpiYOffset = 15;
	var _primTextYOffset=18; 
	//var METRIC_DATES_Y=-190;

	if (!scale) scale=METRICS_SCALE;
	_kpiYOffset = _kpiYOffset*scale;
	_primTextYOffset = _primTextYOffset*scale;
	
	console.log("***_renderMetrics: column="+column);
	var _metricContext = _getMetricContextByColumn(column);
	
	// dimension + interval (start-end) qualify the data series to select 
	// (e.g. dimension="actual" + (intervalStart="2013-01-01" , intervalEnd="2013-03-31") 
	// ==> this would select the actuals Q1 2013 series
	var dimension = _metricContext.dimension;
	var intervalStart = _metricContext.intervalStart;
	var intervalEnd = _metricContext.intervalEnd;
	
	// uuhhuuuhhh => legacy crap !!!!
	if (column=="left") forecastDate="";
	
	//forecastdate hardcode is just experiemnt for re-forecasts .....
	// currently there a multiple values per dimension allowed qualified by "forecastDate"	
	var _met = metricData.filter(function(d){return d.dimension==dimension && d.intervalStart==intervalStart && d.intervalEnd==intervalEnd && ( (d.class=="result") || (d.class=="kpi"))});
	
	// actuals are unique (results only one per interval)
	// forecasts can exists multiple times for an interval (re-forecasts!!)
	var forecastDate;
	if (dimension=="forecast"){
		forecastDate = _.last(_metricContext.forecastDate);
		_met = _met.filter(function(d){return d.forecastDate==forecastDate;})
	}

	var _metByLane = _.nest(_met,"lane");
	
	var _kpiDir = "left";
	var _resultDir="right";
	
	var gMetrics = svg.append("g").attr("id","lane_metrics");
	

	if (column=="left"){
			_kpiDir="right";
			_resultDir="left";
			
	}
	
	var _resultSum=0;
	var _deltaSum=0;
	var _delta = 0;
	
	
	for (var m in _metByLane.children){
		var _l = getLaneByNameNEW(_metByLane.children[m].name);
		if (_l){
			i=0;
			var sortedMetrics = _metByLane.children[m].children.sort(function(a, b) { 
						return a.class > b.class?1:-1;	
					});
			for (k in sortedMetrics){
				var _mm = _metByLane.children[m].children[k];
				var _y = y(_l.yt1)+(i*_kpiYOffset);
				var _height = y(_l.yt2-_l.yt1);
				
				//secondary metrics
				var _secTextYOffset = 10;//_height/2;
			
				if (_mm.class=="kpi") {
					_drawTextMetric(gMetrics,_mm,"metricSmall",x2Base,_y+_secTextYOffset,6,_kpiDir,scale,_metricContext);
				}
				else if (_mm.class=="result") {
					_delta = _drawTextMetric(gMetrics,_mm,"metricBig",x1Base,_y+_primTextYOffset,10,_resultDir,scale,_metricContext);
					
					//result breaks
					/*var _xOffset = 45;
					if (_resultDir =="left") _xOffset=35;
					_drawXlink(gMetrics,"#result_break_"+_resultDir,(x1Base-_xOffset),_y+_primTextYOffset-15,{"scale":.6,"opacity":0.5});*/
				
					
					console.log("*** _delta= "+_delta);
					
					if (_mm.sustainable==1) {
						_resultSum = _resultSum+parseInt(_mm.number);
						_deltaSum = _deltaSum+parseInt(_delta);
						console.log("******* _deltaSum = "+_deltaSum);
						
					}
				}
				i++
			}
		}
	}


	// calculated sum
	//[TODO] build a proper class structure = this would be a TextMetric m = new TextMetric(...)
	var _yTotal = Y_CORP_METRICS;
	var _total = {"dimension":dimension,"number":_resultSum ,"scale":"mio EUR" ,"type":"NGR", "sustainable":1, "delta":_deltaSum };

	console.log("************************************************** _total.delta = "+_total.delta);


	//metric date 
	_drawMetricDate(svg,x1Base-50,METRIC_BASE_Y,_metricContext);

	// corp result
	var gCorp = svg.append("g").attr("id","corp_metrics");
	var gCorpResult = gCorp.append("g").attr("id","corp_metrics_result");
	_drawTextMetric(gCorpResult,_total,"metricBig",x1Base,_yTotal,10,_resultDir,scale,_metricContext);
	
	
	
	/* result_breaks
	var _xOffset = 45;
	if (_resultDir =="left") _xOffset=30;
	_drawXlink(gCorpResult,"#result_break_"+_resultDir,(x1Base-_xOffset),_yTotal-15,{"scale":.6,"opacity":0.5});
	*/

	// corp KPIs
	var _corpKpis = _met.filter(function(d){return d.lane=="corp" &&d.class=="kpi" &&(d.type=="churn rate" || d.type=="customer value" ||d.type=="channel reach"||d.type=="availability")});
	
	var _yTotalKpiBase = _yTotal-(10*METRICS_SCALE);
	for (var k in _corpKpis){
		_drawTextMetric(gCorp,_corpKpis[k],"metricSmall",x2Base,_yTotalKpiBase-(((getInt(k)+1)*15)*METRICS_SCALE),6,_kpiDir,scale,_metricContext);
	}

	
// ============== sustain share PIE =================
	var _yPie = METRIC_PIE_BASE_Y;
	var _sustainShare= _met.filter(function(d){return d.type=="marketshare" && d.scale=="% sustainable"});
	_drawPie(gCorp,dimension,_sustainShare[0],x1Base-20,_yPie);
	

// ============== CX =================
	var _yCX =METRIC_CX_BASE_Y;
	var _cx1 = _met.filter(function(d){return d.type=="loyaltyindex"});
    var _cx2 = _met.filter(function(d){return d.type=="promoterscore"});
	var _cxData = {"loyalty":_cx1[0].number,"promoter":_cx2[0].number};
	_drawCX(gCorp,_cxData,x1Base+25,_yCX);
	
// ============== overall share =================
	var _yMarketShare = METRIC_SHARE_BASE_Y;
	var _overallShare =_met.filter(function(d){return d.type=="marketshare" && d.scale=="% overall"});
	
	// BUG IN YEAR FORECAST VIEW !!!
	_drawTextMetric(gCorp,_overallShare[0],"metricBig",x1Base-10,_yMarketShare,10,"left",scale,_metricContext);

	return _resultSum;
}

/**
 * icon_bracket<direction><type>
 */
function _drawBracket(svg,color,direction,x,y,scaleX,scaleY,type,opacity){
		if (!type) type="bracket";
		if (!opacity) opacity = 0.15;
	
		_drawXlink(svg,"#icon_"+type+"_"+direction+"_"+color,x,y,{"scale":+scaleX+","+scaleY,"opacity":opacity});
}



function checkPreviousForecasts(metric,comparison){
	var _history = new Array();
	for (var i in metricData){
		var _m = metricData[i];
		if (_m.class==metric.class&&_m.dimension==comparison&&_m.type==metric.type&&_m.lane==metric.lane &&_m.intervalStart==metric.intervalStart&&_m.intervalEnd==metric.intervalEnd &&_m.scale==metric.scale){
			// do not add the identical metric and also only add older than current forecastDate
			if (_m.id !=metric.id ){
				if (metric.dimension=="forecast"){
					if (_m.forecastDate < metric.forecastDate) _history.push(_m);
				}
				else _history.push(_m);
			}
		}
	}
	return _history;
}

/**
 *@direction can be "left" = default or "right" 
 * => left = first number then scale
 * => right = first scale then number
 * 
 * returns _delta or 0
 * */
function _drawTextMetric(svg,metric,css,x,y,space,direction,scale,context){
		var _metricColor;
		var _deltaOffset=70;
		
		console.log("----- end drawTextMetric: "+metric.type+" sustainable: "+metric.sustainable);
		console.log("----- css: "+css);
		
		if (metric.sustainable==1) _metricColor=COLOR_BPTY;//"174D75";
		//risks
		else if (metric.sustainable==-1){
			_metricColor="#ED1C24";
			_deltaOffset = 105;
		}
		//opportunities
		else if (metric.sustainable==2){
			_metricColor="#00A14B";
			_deltaOffset = 105;
		}
		
		else _metricColor="grey";
		
		
	
		// experiment with trending
		// lets see whether we have for this dimension+date multiple class.lane.type metrics 
		// means do we have previous forecasts ? => if yes we can show a trending indicator
	
		// i have the concrete metric which is configured to be shown
		// _history = checkPreviousForecasts(metric);
	
		if(!scale) scale=METRICS_SCALE;
		space=space*scale;
		
		var _anchor = "end";
		var _xNumber = x;
		if (direction=="right") {
			_anchor = "start";
			_xNumber = _xNumber+space;
		}
		
		var gMetric=svg.append("g").attr("id","metric_"+metric.id+"."+metric.lane+"."+metric.class+"."+metric.type+"."+metric.scale);

		_drawText(gMetric,metric.number,_xNumber,(y+space/2),{"anchor":_anchor,"color":_metricColor,"css":css+"Number","scale":scale});
			
		_anchor = "start";
		if (direction=="right") _anchor = "end";
		
		_drawText(gMetric,metric.scale,(x+space/2),(y-space/2),{"anchor":_anchor,"color":_metricColor,"css":css+"Scale","scale":scale});
		_drawText(gMetric,metric.type,(x+space/2),(y+space/2),{"anchor":_anchor,"color":_metricColor,"css":css+"Type","scale":scale});

		
		// ================================ reforecasting ========================================= 

		// 1) first we have to check whether we have configured a comparison here => context.comparison => if empty = no delta + comparison

		if (context.comparison !=""){
			
			var _previous = checkPreviousForecasts(metric,context.comparison);
			//absolute delta between number and comparison
			var _delta = 0;
			var _initial =0;
			
			// relative quotient between number and comparison => used in "hide sensitive views" instead of delta
			var _quotient;
			
			// now we have to take the last of the array as default = show trend from existing to moist recent previous forecast
			
			if ((_previous.length>0 && !isNaN(metric.number) && metric.class!="opportunity" && metric.class!="risk") || metric["delta"]!=null ){
				_pmetric = _.last(_previous);
				// do some calculations
				// stupid javascript sucks in decimal/float
				
				console.log("********************************** _pmetric = "+_pmetric);
				
				if (metric["delta"]!=null) {
					_delta = metric.delta;
					_initial = (metric.number-metric["delta"]);
				}
				else {
					 _delta = Math.round(((metric.number*100)-(_pmetric.number*100)))/100;
					 _initial =_pmetric.number;
				 }

				if (metric["quotient"]!=null) _quotient = metric.quotient;
				else _quotient = Math.round((metric.number/_initial)*100);
				
				
				if (metric.dimension!="baseline"){
					var _color;
					var _xoffset;
					var _yoffset;
					var _symbol;
					var _scale=scale*0.8;
					
					_xoffset = _deltaOffset*scale;
					_yoffsetText = -5;
					_yoffsetSymbol = -1;
					
					if (metric.class=="kpi") {
						_scale =scale*0.5;
						_xoffset = 85*scale;
						_yoffsetSymbol=1;
						_yoffsetText=0;
					}
					
					if ((_delta*metric.direction)  >0) {
						_color="green";
						_symbol = "triangle-up";
						_delta = "+"+_delta;
						
					}
					else if (_delta==0){
						_color = "grey";
						_symbol = "circle";
					}
					else {
						_color="red";
						_symbol="triangle-down";
						// the triangle-down needs slight different y-position ..
						if (metric.class=="result") _yoffsetSymbol=-2;
					}
					// draw trend indicator 
					gMetric.append("path")
					.attr("transform","translate("+(x+_xoffset)+","+(y-_yoffsetSymbol)+") rotate("+(0)+") scale("+_scale+")")
					.attr("d",d3.svg.symbol().type(_symbol))
					.style("fill",_color)
					// and the delta
					_drawText(gMetric,_delta,(x+_xoffset-(8*_scale)),(y-_yoffsetText),{"size":"10px","weight":"normal","anchor":"end","color":_color,"scale":_scale});
					_drawText(gMetric,_initial,(x+_xoffset+(10*_scale)),(y-_yoffsetText),{"size":"10px","weight":"normal","anchor":"start","color":COLOR_BPTY,"scale":_scale});
					
					//quotient
					_drawText(gMetric,_quotient+"%",(x+_xoffset-(8*_scale)),(y-_yoffsetText)+5,{"size":"6px","weight":"normal","anchor":"start","color":COLOR_BPTY,"scale":_scale});
					
					//quotient
					if (metric.class=="result"){
						var gNoNGRMetrics = d3.select("#metrics").append("g").attr("id","metric_noNGR");
						_drawText(gNoNGRMetrics,_quotient+"%",_xNumber,(y+space/2),{"anchor":"start","color":_metricColor,"css":css+"Number","scale":scale});
						_drawText(gNoNGRMetrics,"trend quotient",(x+space/2),(y-space/2),{"anchor":_anchor,"color":_metricColor,"css":css+"Scale","scale":scale});
						_drawText(gNoNGRMetrics,metric.type,(x+space/2),(y+space/2),{"anchor":_anchor,"color":_metricColor,"css":css+"Type","scale":scale});
						gNoNGRMetrics.append("path")
						.attr("transform","translate("+(x+_xoffset)+","+(y-_yoffsetSymbol)+") rotate("+(0)+") scale("+_scale+")")
						.attr("d",d3.svg.symbol().type(_symbol))
						.style("fill",_color)

					}
					

				}
			}	
			return _delta;	
	}
}

function _drawMetricSeparator(svg,x){
		_drawLine(svg,x,METRIC_BASE_Y+20,x,height,"themeLine");
}



/**date marker for metrics
 * */
function _drawMetricDate(svg,x,y,context){
	var gDate = svg.append("g").attr("id","metric_date_"+context.data.title);
	var _title = _drawText(gDate,context.data.title,x,y,{"size":"16px","weight":"bold","anchor":"start","color":COLOR_BPTY});
	var _m =get_metrics(_title.node());
	
	
	if (!context.dimension=="goal"){
		_drawText(gDate,context.data.line1+" ",x,y+7,{"size":"5px","weight":"normal","anchor":"start","color":COLOR_BPTY});
		_drawText(gDate,"[from: "+context.intervalStart.toString('yyyy-MM-dd')+" to: "+context.intervalEnd.toString('yyyy-MM-dd')+" ]",(x+_m.width),y+7,{"size":"6px","weight":"bold","anchor":"end","color":COLOR_BPTY});
		
		_drawText(gDate,context.data.line2+" ",x,y+14,{"size":"5px","weight":"normal","anchor":"start","color":COLOR_BPTY});
		if (context.forecastDate)
			_drawText(gDate,"[ "+_.last(context.forecastDate).toString('yyyy-MM-dd')+" ]",(x+_m.width),y+14,{"size":"6px","weight":"bold","anchor":"end","color":COLOR_BPTY});
			
	}
}



/** helper function
 * */
function _drawPie(svg,id,_data,x,y,scale){
	if (!scale)scale=METRICS_SCALE;
	
	var radius =40*scale;//40*METRICS_SCALE;

    var data = [{"type":"sustainable","percentage":_data.number},{"type":"notsustainable","percentage":100-_data.number}];
    
	var arc = d3.svg.arc()
		.outerRadius(radius - (10*scale))
		.innerRadius(0);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.percentage; });

	var gPie = svg.append("g")
			.attr("id","metric_pie_"+_data.type)
		.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("transform","translate("+x+","+y+")")

	gPie.append("path")
	  .attr("d", arc)
	  .style("fill", function(d) { if (d.data.type=="sustainable") return COLOR_BPTY; else return "grey";})
	  .style("stroke", "#ffffff")
	  .style("stroke-width", 4*scale+"px");


	gPie.append("text")
	  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	  .attr("dy", ".35em")
	  .style("text-anchor", "middle")
	  .style("fill", "#ffffff")
	  .style("font-weight", "bold")
	  .style("font-size", function(d) { return (6+d.data.percentage/8)*scale+"px";})
	  .text(function(d) { return d.data.percentage; })
		.append("tspan")
		.text("%")
		.style("font-size","4px")
		.style("font-weight","normal")
		.append("tspan");
	
}

function _drawCX (svg,data,x,y,scale){
	var gCX = svg.append("g").attr("id","metric_CX");
	
	if(!scale) scale=METRICS_SCALE;
	
	_drawXlink(gCX,"#customer",x,y,{"scale":(.5*scale)});
	
	_drawText(gCX,data.promoter,x+7,y+12,{"size":"8px","weight":"bold","anchor":"start","color":"white"})
		.append("tspan").text("%").style("font-size","4px").style("font-weight","normal");;

	_drawText(gCX,"promoter-score",x-4,y-2,{"size":"5px","weight":"normal","anchor":"start","color":COLOR_BPTY});

	_drawText(gCX,data.loyalty,x+5,y+38,{"size":"12px","weight":"bold","anchor":"start","color":"white"})
		.append("tspan").text("%").style("font-size","4px").style("font-weight","normal");

	_drawText(gCX,"loyalty-index",x,y+50,{"size":"5px","weight":"normal","anchor":"start","color":COLOR_BPTY})
}





function enableAllMetrics(){
	SHOW_METRICS_BASELINE = true;
	SHOW_METRICS_FORECAST1 = true;
	SHOW_METRICS_FORECAST2 = true;
	SHOW_METRICS_GOAL = true;
	SHOW_METRICS_CORPORATE = true;
	SHOW_METRICS_NGR = true;
	setMargin();
	//d3.selectAll("#metrics_baseline,#metrics_forecast1,#metrics_forecast2").style("visibility","hidden");
	
}

function disableAllMetrics(){
	SHOW_METRICS_BASELINE = false;
	SHOW_METRICS_FORECAST1 = false;
	SHOW_METRICS_FORECAST2 = false;
	SHOW_METRICS_GOAL = false;
	SHOW_METRICS_CORPORATE = false;
	setMargin();
	//d3.selectAll("#metrics_baseline,#metrics_forecast1,#metrics_forecast2").style("visibility","hidden");

	
}



// this needs refactoring => flexible views based on configuration to show different scenarios !!

/** defualt view
**/
function safeMetrics(){
	hideNGR();
	hideMetrics([{"name":"goal","hide":true}]);
}


/** view for Q1 2014 review
 * **/
function q1_2014_reviewMetrics(){
	//hideNGR();
	
	hideMetrics([{"name":"goal","hide":true}]);
	hideMetrics([{"name":"forecast2","hide":true}]);
	
}	
	

/*
function fullMetrics(){
	if (!SHOW_METRICS_NGR){
		enableAllMetrics();
		SHOW_METRICS_NGR= true;
		drawAll();
	}	
	else{
		hideNGR();
		drawAll();
	}
}
*/


/** coss cutting view/hide filter
 * can be on column base 
 * 
 * to filter out ALL monetary values in safe mode use:
 * d3.selectAll("[id*=EUR]").style("visibility","hidden");
 */
function hideNGR(column){
	
	if (!column) d3.selectAll("[id*=NGR],[id*=missing]").style("visibility","hidden");
	else d3.select(column).selectAll("[id*=NGR],[id*=missing]").style("visibility","hidden");
	
	d3.selectAll("#metric_noNGR").style("visibility",null);
	
	SHOW_METRICS_NGR=false;
}

// null as value in style or attribute removes the attribute at all
function showNGR(column){
	if (!column) d3.selectAll("[id*=NGR],[id*=missing]").style("visibility",null);
	else d3.select(column).selectAll("[id*=NGR],[id*=missing]").style("visibility",null);
	
	d3.selectAll("#metric_noNGR").style("visibility","hidden");
	
	SHOW_METRICS_NGR=true;
}

function hideGoal(){
	d3.selectAll("#metrics_goal").transition().style("visibility","hidden");
	//hideNGR();
	SHOW_METRICS_GOAL=false;
}

function showGoal(){
	d3.selectAll("#metrics_goal").transition().style("visibility",null);
	//showNGR();
	SHOW_METRICS_GOAL=true;
}


function hidePotentials(){
	d3.selectAll("#metrics_potentials").transition().style("visibility","hidden");
	SHOW_METRICS_POTENTIALS=false;
	console.log("hide potentials..");
}

function showPotentials(){
	d3.selectAll("#metrics_potentials").transition().style("visibility",null);
	SHOW_METRICS_POTENTIALS=true;
	console.log("show potentials..");
}


function hideCorpMetrics(){
	d3.selectAll("[id*=corp_metrics]").style("visibility","hidden")
	d3.selectAll("[id*=metric_date]").transition().duration(300).attr("transform","translate(0,150)")
	hideVision();
	SHOW_METRICS_CORPORATE=false;
 }
 
 function showCorpMetrics(){
	d3.selectAll("[id*=corp_metrics]").transition().delay(300).style("visibility",null)
	d3.selectAll("[id*=metric_date]").transition().duration(300).attr("transform","translate(0,0)")
	showVision();
	SHOW_METRICS_CORPORATE=true;
}	 


function filterMetrics(){
	if (SHOW_METRICS_BASELINE) d3.select("#metrics_baseline").transition().style("visibility",null);
	else d3.select("#metrics_baseline").transition().style("visibility","hidden");
	

	if (SHOW_METRICS_FORECAST2) d3.selectAll("#metrics_forecast2").transition().style("visibility",null);
	else d3.selectAll("#metrics_forecast2").style("visibility","hidden");

	if (SHOW_METRICS_FORECAST1) {d3.select("#metrics_forecast1").transition().delay(300).style("visibility",null);d3.select("#metrics_forecast2").transition().duration(300).attr("transform","translate(0,0)");}
	else {
		d3.select("#metrics_forecast1").style("visibility","hidden");
		d3.select("#metrics_forecast2").attr("transform","translate(-150,0)");
		}
	
	if (SHOW_METRICS_GOAL) showGoal();
	else hideGoal();
	
	if (SHOW_METRICS_NGR) showNGR();
	else hideNGR();


	if (SHOW_METRICS_POTENTIALS) showPotentials();
	else hidePotentials();

	if (SHOW_METRICS_CORPORATE) showCorpMetrics();
	else hideCorpMetrics();
	
}

/**holy shit this is real CRAP code :-))
 * */
function hideMetrics(which){
	
	if (which){
			for (var i in which){
			if (which[i].name=="baseline" && which[i].hide==true && SHOW_METRICS_BASELINE==true){
				SHOW_METRICS_BASELINE=false;
			}
			else if (which[i].name=="baseline" && which[i].hide==false && SHOW_METRICS_BASELINE==false){
				SHOW_METRICS_BASELINE=true;
			}
			
			if (which[i].name=="forecast1" && which[i].hide==true &&SHOW_METRICS_FORECAST1==true){
				SHOW_METRICS_FORECAST1=false;
			}
			else if (which[i].name=="forecast1" && which[i].hide==false &&SHOW_METRICS_FORECAST1==false){
				SHOW_METRICS_FORECAST1=true;
			}
			
			if (which[i].name=="forecast2" && which[i].hide==true && SHOW_METRICS_FORECAST2==true){
				SHOW_METRICS_FORECAST2=false;
			}
			else if (which[i].name=="forecast2" && which[i].hide==false && SHOW_METRICS_FORECAST2==false){
				SHOW_METRICS_FORECAST2=true;
			}
			if (which[i].name=="goal" && which[i].hide==true && SHOW_METRICS_GOAL==true){
				hideGoal();
			}
			else if (which[i].name=="goal" && which[i].hide==false && SHOW_METRICS_GOAL==false){
				showGoal();
			}
			if (which[i].name=="potentials" && which[i].hide==true && SHOW_METRICS_POTENTIALS==true){
				hidePotentials();
			}
			else if (which[i].name=="potentials" && which[i].hide==false && SHOW_METRICS_POTENTIALS==false){
				showPotentials();
			}
		
		}
	}
}


// --------------------------------- experiments

function Metric(id,type,scale,metric){
	this.id =id;
	this.type=type;
	this.scale=scale;
	this.metric=metric;
}
Metric.prototype.getInfo=function(){
	return JSON.stringify(this);
}

