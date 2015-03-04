/** NG version (2.0) based on node.js express and new data structures 
* depends on:
* @version: 2.0
 * @author: Gerold Kathan
 * @date: 2015-01-23
 * @copyright: 
 * @license: 
 * @website: www.github.com/gkathan/kanban
 */


var postitData;







var POSTIT_SCALE=1;
var CUSTUM_POSTIT_SCALE=1;

/** 
 * @svg d3 reference
 * @d data 
 */
function _drawPostit(svg,d){
	
	var gPostit= svg.append("g")
	.attr("id",function(d){return "postit_"+d.id})
	
	var _size = d.size*ITEM_SCALE;
	var _itemXPlanned = x(new Date(d.planDate));
	var _itemXActual = x(new Date(d.actualDate));
	var _itemXStart = x(new Date(d.startDate));
	var _yOffset = getSublaneCenterOffset(getFQName(d));
	//d.sublaneOffset = override for positioning of otherwise colliding elements => manual !
	var _itemY = y(getSublaneByNameNEW(getFQName(d)).yt1-_yOffset)+getInt(d.sublaneOffset);
	
	// ------------  postits --------------
	if(d.state=="todo")
	{
		var postit_x_offset = -2*_size+2;
		var postit_y_offset = -2*_size*POSTIT_SCALE;
		var postit_x =_itemXPlanned+postit_x_offset;
		var postit_y =_itemY+postit_y_offset;
		
		var _rmax=5,
			_rmin=-5;						;
		
		var _rotate = Math.floor(Math.random() * (_rmax - _rmin + 1) + _rmin);
		var _scale = (_size/8)*POSTIT_SCALE;
		
		_drawXlink(gPostit,"#postit_yellow",postit_x,postit_y,{"scale":_scale,"rotate":_rotate});
		
		_drawText(gPostit,"todo:",(postit_x+1),(postit_y+5),{"size":(3+_size/6)+"px","color":"red","weight":"bold","anchor":"start","rotate":_rotate,"scale":POSTIT_SCALE})
			.append("tspan")
			.attr("dy",5)
			.attr("x",0)
			.text("id:"+d.id);
	}
}



/** ola - my first class in javascript ;-)
 */
function Postit(id,text,x,y,scale,size,color,textcolor){
	if (!id) this.id=new Date().getTime();
	else this.id=id;
	this.text=text;
	if (!color) this.color="yellow";
	else this.color=color;
	if (!textcolor)	this.textcolor="black";
	else this.textcolor=textcolor;
	if (!scale)	this.scale=1;
	else this.scale=scale;	
	if (!size) this.size=4;
	else this.size=size;	
	this.x=x;
	this.y=y;
	

	
	console.log("constructor: "+this.getInfo());
}

Postit.prototype.getInfo=function(){
	return JSON.stringify(this);
}

Postit.prototype.setTitle=function(title){
	this.title=title;
}


Postit.prototype.save=function(){
	var _insert = JSON.stringify(this);
	console.log("save: "+_insert);

	$.ajax({
        type: "POST",
        url: "/api/kanbanv2/rest/postit",
        data: _insert,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){consoloe.log(data);},
        failure: function(errMsg) {
            consoloe.log(errMsg);
        }
  });
}

Postit.prototype.remove=function(){
	var _remove = JSON.stringify(this);
	console.log("delete: "+_remove);

	$.ajax({
        type: "DELETE",
        url: "/api/kanbanv2/rest/postit",
        data: _remove,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){console.log(data);},
        failure: function(errMsg) {
            console.log(errMsg);
        }
  });
}

Postit.prototype.update=function(){
	var _update = JSON.stringify(this);
	console.log("call update: "+_update);

	$.ajax({
        type: "POST",
        url: "/api/kanbanv2/rest/postit",
        data: _update,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){console.log(data);},
        failure: function(errMsg) {
            console.log(errMsg);
        }
  });
}



Postit.prototype.draw=function(svg){
	var p=this;
	
	var movedX,movedY;
	
	console.log("in draw(): "+this.getInfo());
	//postits drag and drop
	var drag_postit = d3.behavior.drag()
		.on("dragstart", function(d,i) {
		   d3.select(this).style("opacity",0.6);
			movedX=0;
			movedY=0;
			
			console.log("dragstart= d.x: "+d.x+" - d.y: "+d.y+ " p.x: "+p.x+" p.y: "+p.y);
			d3.select(this).attr("transform", function(d,i){
				return "translate(" + [ d.x,d.y ] + ")"
			})
			
		})	

		.on("drag", function(d,i) {
			
			d.x += d3.event.dx
			d.y += d3.event.dy
			
			movedX += d3.event.dx
			movedY += d3.event.dy
			
			console.log("drag= d.x:"+d.x+" - d.y:"+d.y+" p.x: "+p.x+" p.y: "+p.y+ "--- movedX: "+movedX+" movedY: "+movedY);
			
			d3.select(this).attr("transform", function(d,i){
				return "translate(" + [ d.x,d.y ] + ")"
			})
		})	
		.on("dragend",function(d,i){
			//postit update position
			if (movedX>0 || movedY>0){
				p.x=getInt(movedX)+getInt(p.x);
				p.y=getInt(movedY)+getInt(p.y);
			p.update();
			}
			console.log("dragend event: x="+d.x+", y="+d.y+" p.x: "+p.x+" p.y: "+p.y);
			d3.select(this).style("opacity",1);
		
		});
	
	
	var postit=svg.append("g")
		.attr("id","postit_"+this.id)
		.data([ {"x":0, "y":0} ])
		.call(drag_postit);

	var _rmax=3,
		_rmin=-3;						;

	var _rotate = Math.floor(Math.random() * (_rmax - _rmin + 1) + _rmin);
	
	var _split = this.text.split("/");

	_drawXlink(postit,"#postit_"+this.color,this.x,this.y,{"scale":this.scale,"rotate":_rotate,"cursor":"pointer"});

		
	var _x = (getInt(this.x)+Math.sqrt(this.scale)+1);
	var _y = (getInt(this.y)+Math.sqrt(this.scale)-1);
	
	if (this.title){
		postit.append("text")
		.text(this.title)
		.style("text-anchor","start")
		.style("font-size",this.size+"px")
		.style("font-family","courier")
		.style("font-weight","bold")
		.style("cursor","pointer")		
		.style("letter-spacing","-0.1")
		.style("kerning","-0.1")
		
		.style("text-anchor","start")
		.style("fill",this.textcolor)
			.attr("transform","translate("+_x+","+(_y+(4*this.size))+") scale("+this.scale+") rotate("+_rotate+")");
		_y+=4*this.size;
	}
	
	
	var _size = this.size-0.5;
	var t =postit.append("text")
	.style("text-anchor","start")
		.style("font-size",(_size)+"px")
		.style("font-family","courier")
		.style("font-weight","normal")
		.style("cursor","pointer")		
		.style("letter-spacing","-0.1")
		.style("kerning","-0.1")
		
		.style("text-anchor","start")
		.style("fill",this.textcolor)
			.attr("transform","translate("+_x+","+_y+") scale("+this.scale+") rotate("+_rotate+")");
	
	textarea(t,this.text,1,4,16,_size);
	
	postit.append("path")
	.attr("transform","translate("+((22*this.scale)+getInt(this.x))+","+(getInt(this.y)+(2*this.scale))+") rotate("+(45+_rotate)+") scale("+(0.25*this.scale)+")")
	.attr("d",d3.svg.symbol().type("cross"))
	.style("fill","grey")
	.on("click",function(d){postit.remove();p.remove()});	
}

function loadPostits(){
	//d3.json("data/data.php?type=postits",handlePostits);
}



