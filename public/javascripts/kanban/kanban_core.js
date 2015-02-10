/** NG version (2.0) based on node.js express and new data structures 
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.github.com/gkathan/kanban
 */



/**
 * create hierarchical data structure from flat import table
 *
 * createLaneHierarchy(initiativeData,ITEMDATA_FILTER,ITEMDATA_NEST.length)
 * createLaneHierarchy(targetData,ITEMDATA_FILTER,ITEMDATA_NEST.length)
 */
function createLaneHierarchy(data,dataFilter,nestConfig,context){
	// create hierarchical base data from list
	// number of max levels in the lanePath 
	var _level =3;
	
	var items = initiativeData.map(function(d) { return d.lanePath.split('/'); });

	// emulate legacy behavior to get the first level below the "bm"="b2c gaming" node ...
	var _hierarchy = buildTreeFromPathArray(items)[0];
	
	_hierarchy = createRelativeCoordinates(_hierarchy,0,_level,context);
	
	_hierarchy = transposeCoordinates(_hierarchy,_level);
	
	return _hierarchy;
}

/** helper 
 * **/
function _buildFilter(filter){
	var _f="";
	for (var f in filter){
		_f+="d."+filter[f].name+filter[f].operator+"\""+filter[f].value+"\"";
		if (f <(filter.length-1)) _f+=" || ";
	}
	return _f;
}

/** recursive traversion to enrich the itemData structure with y coordinates
 * y1,y2 = local relative distribution per depth level
 *
 * context:
 * 		_itemData.y1 = Y_MIN;
		_itemData.y2 = Y_MAX;
		_itemData.name=CONTEXT;
		_itemData.depth=0;
		_itemData.level="root";

 * 
 */
function createRelativeCoordinates(_itemData,_start,_stop,_context){
	
	// root
	if (_start==0){
		_itemData.y1 = _context.yMin;
		_itemData.y2 = _context.yMax;
		_itemData.name= _context.name;
		_itemData.depth=0;
		_itemData.level="root";
	}
	if (_itemData.children){
		_start++;
		//calculate sum of all children
			var _sum=0;
			for (var i in _itemData.children){
				_sum=_sum+_itemData.children[i].children.length;
			}
			_itemData.childsum=_sum;
		//calculate sum end
		for (i in _itemData.children){
			_itemData.children[i].depth=_start;
			_itemData.children[i].name=_itemData.name+FQ_DELIMITER+_itemData.children[i].name;
			//_itemData.children[i].level=ITEMDATA_NEST[_start-1];
			_itemData.children[i].level=_start;

			if (_itemData.children[i].children && _stop >_start){
				//recurse deeper
				createRelativeCoordinates(_itemData.children[i],_start,_stop,_context);
			}
			else {
				console.log("end of recursion");
			}
			// calculate coordinates
			var _y1,_y2;
			if (i==0) {
				_y1 = 0;
			}
			else {
				_y1 = parseFloat(_itemData.children[parseInt(i-1)].y2);
			}	
			
			//default mode ="auto"
			if (_itemData.childsum == 0){
				_y2 = _context.yMax/_itemData.children.length;
			}
			else _y2 = _context.yMax*(_itemData.children[i].children.length/_itemData.childsum);

			
			//check if mode is set to "equal"
			if (getConfigModeByLevel(_itemData.children[i].level)=="equal"){
				_y2 = _context.yMax/_itemData.children.length;
			}
			// check manual percentage override
			var _config = getConfigByLevel(_itemData.children[i].level);
			// 20140205 => needs more thinking 
			//var _config = getConfig(_itemData.children[i]);
			
			if (_config){
				// ok got a config for this level - now check whether we find a matching config 
				// check for match in config.percentages
				if (_config.percentages){
					var _name = _itemData.children[i].name;
					for (var p in _config.percentages){
						console.log("...name:"+_name);
						if (_name.indexOf(_config.percentages[p].name)>=0 &&(_context.name==_config.percentages[p].context ||_config.percentages[p].context=="*") ){
							_y2=_config.percentages[p].value;
							console.log("_y2 override:"+_y2);
						}
					}
				}
				//console.log("config for: "+_itemData.children[i].name+" :"+_config);
				//_y2= _config;
			}
			// end override check 
			
			_y2 = _y2+_y1;
			
			_itemData.children[i].y1=_y1;
			_itemData.children[i].y2=_y2;
		}
		// after loop stuff
	}
	else{
		//console.log("....no more children found..");
	}
	
	return _itemData;
}
	
	
	
/**
 * and here comes another magic ;-)
 * we are transposing now 
 * taking upper distribution as 100% 
 * e.g. if we are in the root.topline lane (71%)
 * the 71% becomes the new 100% in this context
*/
function transposeCoordinates(data,level){
	
	for (count=1;count<=level;count++){
		console.log("i: "+count);
		data = createAbsoluteCoordinates(data,0,count,1);
	}
	return data;
}


/** yt1,yt2 = transposed absolute y coordinates
*/
function createAbsoluteCoordinates(_itemData,_start,_stop,base){
	//zero-level
	var _yMax =100;
	
	if (_start==0){
		_itemData.yt1 = _itemData.y1;
		_itemData.yt2 = _itemData.y2;
	}
	console.log("enter depth: "+_start);
	if (_itemData.children){
		var _base = base*((_itemData.y2-_itemData.y1)/_yMax);
		
		_start++;
		for (i in _itemData.children){
			
			if (_itemData.children[i].children && _stop >_start){
				//recursion
				createAbsoluteCoordinates(_itemData.children[i],_start,_stop,_base);
			}
			else {
				console.log("depth: "+_start+" STOP level");
				_itemData.children[i].yt1 = _itemData.yt1+(_itemData.children[i].y1*_base);
				_itemData.children[i].yt2 = _itemData.yt1+(_itemData.children[i].y2*_base);
				
			}
		}
	}
	else{
		console.log("....no more children found..");
	}
	
	return _itemData;
}


/** prints current lane config
 */
function traversePrint(_itemData,_start,_stop){
	
	console.log("level: "+_itemData.depth+" "+_itemData.name+" coordinates [y1,y2]: "+_itemData.y1+","+_itemData.y2+ " -- coordinates transposed [yt1,yt2]: "+_itemData.yt1+","+_itemData.yt2);
	
	if (_itemData.children){
		_start++;
		for (i in _itemData.children){
			
			// do in-level stuff 
			
			if (_itemData.children[i].children && _stop >=_start){
				//console.log(" recurse deeper...");
				traversePrint(_itemData.children[i],_start,_stop);
			}
			else {
				// do whtever needs to be don on the stop-level
				//console.log("...end of recursion");
			}
		}
		// after loop stuff
	}
	else{
		//console.log("....no more children found..");
	}
}

/**
 * prints current setup of lanes to console
 * WORKS ONLY IN NEST=3 LEVEL CONTEXT !!!
 */
function printItemData(itemData,depth){
	console.log("itemdata:");
	console.log("---------");

	//themes
	for (var i0 in itemData.children){
		var _y01=(itemData.children[i0].y1).toFixed(2);
		var _y02=(itemData.children[i0].y2).toFixed(2);
		
		if (depth==1 ||!depth) console.log("+ theme: "+itemData.children[i0].name+" [yt1: "+_y01+" yt2: "+_y02+"] height: "+(_y02-_y01).toFixed(2));
		//lanes
		for (var i1 in itemData.children[i0].children){
			var _y11=(itemData.children[i0].children[i1].yt1).toFixed(2);
			var _y12=(itemData.children[i0].children[i1].yt2).toFixed(2);
			var _p1 = (itemData.children[i0].children[i1].y2-itemData.children[i0].children[i1].y1).toFixed(2);
		
			if (depth==2 ||!depth) console.log("    + lane: "+itemData.children[i0].children[i1].name+" [yt1: "+_y11+" yt2: "+_y12+"] height: "+(_y12-_y11).toFixed(2)+" ("+_p1+"%)");
			//sublanes
			for (var i2 in itemData.children[i0].children[i1].children){
				var _y21=(itemData.children[i0].children[i1].children[i2].yt1).toFixed(2);
				var _y22=(itemData.children[i0].children[i1].children[i2].yt2).toFixed(2);
				var _p2 = (itemData.children[i0].children[i1].children[i2].y2-itemData.children[i0].children[i1].children[i2].y1).toFixed(2);
		
				if (depth ==3 ||!depth)console.log("       + sublane: "+itemData.children[i0].children[i1].children[i2].name+" [yt1: "+_y21+" yt2: "+_y22+"] height: "+(_y22-_y21).toFixed(2)+" ("+_p2+"%)");
			}
		}
	}
}

/**not used yet ...
 */
function checkDistributionOverride(override){

	var _checksum = 0;
	for (var o in override.dist){
		
		console.log("+++++++++++++++++++ checksumming"+override.dist[o].value);
		
		_checksum = _checksum+override.dist[o].value;
	}
	
	if (_checksum !=100) return false;
	return true;
}


