var _excelExportURL = '/api/space/export/xlsx/';

var admingrid;

var columnFilters={};

var _type=getUrlVars()["type"];
var _filter=getUrlVars()["setfilter"];
// subquerystring ist in format name1^value1,name2^value2...
// e.g. http://localhost:3000/admin?type=incidents&setfilter=priority^P01,state^Closed
var _subfilter=[];

if (_filter){
	var _split=_filter.split(",");
	for (var i in _split){
		var _name = _split[i].split("^")[0];
		var _value = _split[i].split("^")[1];
		var _item={name:_name,value:_value};
		_item[_name]=_value
		_subfilter.push(_item);
	}
}
var _id =getUrlVars()["_id"];

//set link for excel download
document.getElementById("lexcel").href=_excelExportURL+_type;
$("#admintype").text(_type);

initShortcuts();
refresh(_type);


function refresh(collection){
	console.log("---------------------- dataSourceFor(collection): "+dataSourceFor(collection));
	$.ajax({
		type: "GET",
		url: dataSourceFor(collection),
		cache: true,
		success: function(data){
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
		error: function(msg){
				console.log("==== error handler...");
		}
	});
}


function renderAdminGrid(data,conf){
	var columns = [];
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		  cssClass: "slick-cell-checkboxsel"
	});
	var _editable = true;
	if (conf.mode=="readonly") _editable = false;
	var _addRow = false;
	if (conf.addRow=="enabled") _addRow = true;
	var _sortby;
	if (conf.sortBy) _sortby = conf.sortBy;
	// adds element in beginning of array
	if (_editable) conf.fields.unshift(checkboxSelector.getColumnDefinition());
	columns= columns.concat(conf.fields);
	var options = {
		editable: _editable,
		enableAddRow: _addRow,
		enableCellNavigation: true,
		asyncEditorLoading: true,
		cellHighlightCssClass: "changed",
		//multiColumnSort: true,
	 	autoEdit: true,
		showHeaderRow:true,
		explicitInitialization:true,
		autoHeight: true
	}

	var dataView = new Slick.Data.DataView({ inlineFilters: true });

	$('#countitems').html(dataView.getLength());

  admingrid = new Slick.Grid("#adminGrid", dataView, columns, options);

	var pager = new Slick.Controls.Pager(dataView, admingrid, $("#pager"));


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
	  var columnId = $(this).data("columnId");
	  if (columnId != null) {
	    columnFilters[columnId] = $.trim($(this).val());
	    dataView.refresh();
			_updateGrid();
	  }
	});

  //from query GET string
  if (_id){
		columnFilters["_id"] = _id;
	}

	if (_subfilter.length>0){
		for (var i in _subfilter){
			columnFilters[_subfilter[i].name] = _subfilter[i].value;
		}
	}

	admingrid.onHeaderRowCellRendered.subscribe(function(e, args) {
	  $(args.node).empty();
	  $("<input type='text'>")
     .data("columnId", args.column.id)
     .val(columnFilters[args.column.id])
     .appendTo(args.node);
	});

	//admingrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
	admingrid.setSelectionModel(new Slick.RowSelectionModel());

  admingrid.registerPlugin(checkboxSelector);

  var columnpicker = new Slick.Controls.ColumnPicker(columns, admingrid, options);

	if (_sortby){
	  dataView.sort(function(a, b) {
			return (new Date(a[_sortby]) > new Date(b[_sortby])) ? 1 : -1;
		},false);
	}


	dataView.beginUpdate();
  dataView.setFilter(filter);
	dataView.setItems(data,"_id");
  dataView.endUpdate();
	dataView.syncGridSelection(admingrid, true);


	//dataView.refresh();

	$(".slick-pager-settings-expanded").toggle();

	$('#countitems').html(admingrid.getDataLength());

	admingrid.init();
	admingrid.getData().setPagingOptions({pageSize:25})
	// ------------------------  column filter ----------------------------------
	admingrid.render();
	_updateGrid();
}

function _updateGrid(){
		$('#adminGrid').css("width",_calculateWidth());
		$('#adminGrid').css("height",_calculateHeight());
}

function _calculateWidth(){
	var _width=0;
	var _columns = admingrid.getColumns();
	for (var i in _columns){
		_width+=_columns[i].width;
	}
	return _width;
}

function _calculateHeight(){
	//header stuff
	var _height=30;
	//var _rows = admingrid.getDataLength();
	var _rows = admingrid.getData().getPagingInfo().pageSize;

	console.log("_rows: "+_rows);

	_height+= _rows *26;

	return _height;
}


function toggleFilterRow() {
  admingrid.setTopPanelVisibility(!admingrid.getOptions().showTopPanel);
}

/**
* for column filter prototype
*/
function filter(item) {
  for (var columnId in columnFilters) {
    if (columnId !== undefined && columnFilters[columnId] !== "") {
      //console.log("**** filter triggered: columnId: "+ columnFilters[columnId]);
      var c = admingrid.getColumns()[admingrid.getColumnIndex(columnId)];
      //console.log("**** filter triggered: c: "+item[c.field]);
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

$("#bremove").click(function(){
		console.log("REMOVE selected rows: "+admingrid.getSelectedRows());
		deleteList = new Array();
		var _sel = admingrid.getSelectedRows();
		for (var s in _sel){
				deleteList.push(admingrid.getData().getItem(_sel[s])["_id"]);
		}
		//kanban_utils.js
		ajaxCall("DELETE","remove",deleteList,_type,refresh);
	});

$("#bsave").click(function(){
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
