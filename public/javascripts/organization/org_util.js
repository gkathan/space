/**
 * shared org functions
 * used by org.html, org_tree.html, org_radial.html
 * 
 */
function getSize(data,tresholdMax,tresholdMin){
	if (!tresholdMax) tresholdMax = 30;
	if (!tresholdMin) tresholdMin = 4;
	
	var _size=data.overallReports?(Math.sqrt(data.overallReports)):tresholdMin;
		  if (_size>tresholdMax) _size = tresholdMax;
		  if (_size<tresholdMin) _size = tresholdMin;
		  
	//if (data.depth &&data.depth<=4 && data.depth>=3) _size = _size*((4-data.depth));
	return _size;
}

/*
function getSize(data,tresholdMax,tresholdMin){
	//if (!tresholdMax) tresholdMax = 100;
	if (!tresholdMin) tresholdMin = 5;
	
	var _levelQuotient=(MAX_LEVEL-data.level)/MAX_LEVEL;
	var _countQoutient=1;
	if (data.overallReports) _countQoutient =(data.overallReports/MAX_COUNT);
	//if (_countQoutient<0.1)_countQoutient*=9;
	
	tresholdMax = 30;
	
	var _size=tresholdMax*_levelQuotient*_countQoutient;
	//leaf nodes
	if (!data.overallReports) _size=tresholdMin;;
	
	
		  //if (_size>tresholdMax) _size = tresholdMax;
		  if (_size<tresholdMin) _size = tresholdMin;
		  
	//if (data.depth &&data.depth<=4 && data.depth>=3) _size = _size*((4-data.depth));
	return _size;
}
*/

/*
 
 MAX_LEVEL is 100% of fontsize in all views
 * e.g. root: MAX =9  (overall = 3000) => fontsize should be 50
 * drill-in to level 6 => MAX=3  (overall =50) => should also be 50 (currently will be 

  MAX=3
  LEVEL =3
  * abweichung (3/3)= 1 => size =100%
  * 
  MAX=3
  LEVEL=2
  * abweichung =(2/3)= 67% => 
  
   
   => currently just mapped to overall size...
   => overallsize should just be an "on-top multiplicator"
   in both cases we want top level with similar relative fontsize 

   => furtheron it depends on:
   * level and number on nodes per level compared to HEIGHT
   * e.g. top level, number of nodes = 1 and HEIGHT = 1000 => MAX size possible (no issue)
   * e.g. leaf level: number of nodes 100, HEIGHT =1000 => quotient =10 ... hmm still fine 

*/

/**
 * prepares the flat array for input into tree creation
 * @param:name defines the mapping attribute for name 
 * @param:parent defines the mapping attribute for parent 
 * @param:parentBase: fallback if parent has no value
 * */
function createList(data,name,parent,parentBase){
	var _list = new Array();
	var i=0;
	for (d in data){
		var row ={};
		row["name"]=data[d][name];
		row["parent"]=data[d][parent]?data[d][parent]:data[d][parentBase];
		
		row["employee"]=data[d]["First Name"]+" "+data[d]["Last Name"];;//data[d]["Full Name"];
		row["supervisor"]=data[d][parent];
		
		row["function"]=data[d]["Function"];
		row["position"]=data[d]["Position"];
		row["vertical"]=data[d]["Vertical"];
		row["location"]=data[d]["Location"];
		row["gender"]=data[d]["Gender"];
		row["ageYears"]=((new Date() - new Date(data[d]["Date Of Birth"]))/(1000*60*60*24*365)).toFixed(1);
		row["companyYears"]=((new Date() - new Date(data[d]["Date First Hired"]))/(1000*60*60*24*365)).toFixed(1);
		row["terminationDate"]=data[d]["Actual Termination Date"];

		row["jobTitle"]=data[d]["Corporate Job Title"];
		row["jobTitleLocal"]=data[d]["Local Job Title"];
		row["jobTitle"]=data[d]["Corporate Job Title"];
		row["job"]=data[d]["Job"];
		
		row["scrum1"]=data[d]["Scrum Team 1"];
		row["scrumMaster"]=data[d]["Scrum Master Name"];
		row["contractType"]=data[d]["Contract Type"];
		row["dateHired"]=data[d]["Date First Hired"];
		row["dateTermination"]= data[d]["Actual Termination Date"];
		
		_list.push(row);
	}
	return _list;
		
}

function findNorbert(data){
	for (d in data){
		//if (data[d]["name"]=="Mr. Norbert Franz Teufelberger") return data[d];
		if (data[d]["name"]=="E2870") return data[d];
	}
}



function findAndreas(data){
	for (d in data){
		//if (data[d]["name"]=="Mr. Andreas Meinrad") return data[d];
		if (data[d]["name"]=="E2874") return data[d];
	}
	
}
function findGuy(data){
	for (d in data){
		if (data[d]["name"]=="Mr. Guy Duncan") return data[d];
	}
	
}


function findJochen(data){
	for (d in data){
		//if (data[d]["name"]=="Mr. Joachim Baca") return data[d];
		if (data[d]["name"]=="E2873") return data[d];
	}
	
}


/** 
 * builds a tree structure from flat array which has parent information 
 */
 
function makeTree(data){
	// *********** Convert flat data into a nice tree ***************
	// create a name: node map
	var dataMap = data.reduce(function(map, node) {
		map[node.name] = node;
		return map;
	}, {});
	
	this.dataMap = dataMap;

	// create the tree array
	var treeData = [];
	data.forEach(function(node) {
		// add to parent
		var parent = dataMap[node.parent];
		if (parent) {
			// create child array if it doesn't exist
			(parent.children || (parent.children = []))
				// add node to child array
				.push(node);
		} else {
			// parent is null or missing
			treeData.push(node);
		}
	});
	this.treeData = treeData;
	return treeData;
	
}



/**
 * calculates the total cumulative "weight" (=sum of all descendants in a tree)
 * and attaches this as attribute "sumDescendants" in the array 
 */
function count(tree,sum){
	console.log("(debug)...in count: "+tree.name);
	if (!tree.children){
		
		//console.log("-- leaf: "+tree.name+" supervisor: "+tree.parent.name+"  has "+tree.parent.children.length+" direct reports");
		console.log("-- leaf: "+tree.name+" supervisor: "+tree.parent);
		
		return 1;
	}
	
	var _s =1;
	var _leafOnly=0;
	for (var c in tree.children){
		_s+=count(tree.children[c],sum);
		if (!tree.children[c].children) _leafOnly+=1;
	}
	var _overall=sum+_s-1;
	tree.overallReports=_overall;
	tree.leafOnly=_leafOnly;
	
	tree.directReports=tree.children.length;
	tree.averageSubordinates = Math.round((_overall-tree.directReports)/tree.directReports);
	
	console.log(tree.name+" (level: "+tree.depth+" - has: "+tree.children.length+" children"+" ...overall below reports: = "+(_overall));
	return (sum+_s);
}

/** after count we can enrich
 */
function enrich(tree,level){
	console.log("*start enrich...");
	if (!level) level=0;
	tree.level=level;
	
	if (!tree.children) return level ;
	else level++;
	for (var c in tree.children){
		enrich(tree.children[c],level);
	}
	
	// at this point we just have "text reference" to parent, not yet an object ....
	var _parent = searchBy(orgTree,"name",tree.parent);
	
	if (_parent){
		tree.averageDeviation= tree.overallReports-_parent.averageSubordinates;
		console.log("----setting deviation: "+tree.averageDeviation);
	}
	//return level;
}

/** doing some calculations 
 * 1) counts the number of nodes overall per depth level
 */
function calculateTreeStats(tree){
	orgLevels = traverseBF(tree);
	MAX_LEVEL=orgLevels.length;
	var stats=new Array();
	//only if tree consists of no children then we have already on top of tree a leaf node ;-)
	if (tree.children) stats.push({leafOnly:0,termination:0});
	for (var o in orgLevels){
		var s = {leafOnly:0,termination:0};
		for (var l in orgLevels[o]){
			if (orgLevels[o][l].leafOnly) s.leafOnly+=orgLevels[o][l].leafOnly;
			if (orgLevels[o][l].terminationDate) s.termination++;
		}
		stats.push(s)
	}
	return stats;
}


/**
 * recursive search by name and value
 * and returns the match as new root
 */
function searchBy(tree,searchName,searchValue){
	if (tree[searchName] == searchValue) return tree;
	
	var temp;
	var children = tree.children;
	
	if (children){
		for (var i in children){
			temp=searchBy(children[i],searchName,searchValue);
			if (temp) return temp;
		}
	}
	return null;
}

function find (name){
	return searchBy(orgTree,"employee",name);
}


/**
 * takes an array of objects as input
 * gives back unique array of specified attribute
 */
function getUniqueByColumn(inputArray,attribute)
{
    var outputArray = [];
    
    for (var i = 0; i < inputArray.length; i++)
    {
        if ((jQuery.inArray(inputArray[i][attribute], outputArray)) == -1)
        {
            outputArray.push(inputArray[i][attribute]);
        }
    }
   
    return outputArray;
}

function countLocations(inputArray){
	return getUniqueByColumn(inputArray,"Location").length;
}

function countEmployees(inputArray){
	return getUniqueByColumn(inputArray,"Employee Number").length;
}

function countMaxDepth(inputTree,count){
		
		var level = inputTree.level;
		if (!inputTree.children) return ++count;
		if (inputTree.children){
			count++;
			
			console.log("* has children.. count: "+count);
			for (var i in inputTree.children){
					count=countMaxDepth(inputTree.children[i],count);
			}
		}
			
		return count;
}



function _t(tree){
	console.log("_t says: visited "+tree.name);
}

function _isLeaf(tree){
	if (!tree.children){
		 console.log(tree.name+": IS leaf");
	 }
	console.log("** "+tree.name+" NOT leaf");	
	return 1;
	
	return 0;
}

function _countLeaf(tree,count){
	if(!count) count=0;
	console.log("*count: "+count);
	return count+(_isLeaf(tree));
}



function traverseDF(node,func){
	if (func) {
        func(node);
    }
 
    _.each(node.children, function (child) {
        traverseDF(child, func);
    });
}


function _t(tree){
	console.log("_t says: visited "+tree.name+" level: "+tree.level);
}


function traverseBF(node,func){
	var q = [node];
	var levels = new Array();
	var count=0;
		
    while (q.length > 0) {
        count++;
        node = q.shift();
        if (!levels[node.level]) levels[node.level] = new Array();
        levels[node.level].push(node);
        if (func) {
            func(node);
        }
 
        _.each(node.children, function (child) {
            q.push(child);
        });
	}
	
	console.log("MAX level = "+levels.length+" --- count="+count);
	return levels;
	
}


function segmentByCriteria(data,criteria){
	return _.nest(data,[criteria]);
}

function segmentByGender(data){
	return segmentByCriteria(data,"gender");
}

function segmentByContractType(data){
	return segmentByCriteria(data,"contractType");
}

function segmentByScrumTeam(data){
	 return segmentByCriteria(data,"Scrum Team 1");
}

/**returns percent rounded
 */
function getFemaleQuotient(data,criteria){
	var segment;
	if (criteria) segment = segmentByCriteria(data,criteria);
	else segment = segmentByGender(data);
	var _female = 0;
	var _male = 0;
	for (var i in segment.children){
		if (segment.children[i].name=="Female") _female=segment.children[i].children.length;
		if (segment.children[i].name=="Male") _male=segment.children[i].children.length;
	}
	return Math.round((_female/(_male+_female))*100)
}


function getInternalQuotient(data,criteria){
	var segment;
	if (criteria) segment = segmentByCriteria(data,criteria);
	else segment = segmentByContractType(data);
	var _internal = 0;
	var _nonInternal = 0;
	for (var i in segment.children){
		if (segment.children[i].name=="Internal") _internal=segment.children[i].children.length;
		else _nonInternal+=segment.children[i].children.length;
	}
	return Math.round((_internal/(_internal+_nonInternal))*100)
}

function show(data){
	for (var i in data){
		var _text = "";
		_text+="name: "+data[i].name;
		if (data[i].children) _text+=" members: "+data[i].children.length;
		console.log(_text);
	}
}
