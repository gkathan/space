
// =================================== D3 helper functions ==========================================

function _drawXlink(svg,href,x,y,style,id){
	if (!style.rotate) style.rotate=0;
	if (!style.scale) style.scale=1;

	var _xlink = svg.append("use")
		.attr("id",id)
		.attr("xlink:href",href)
		.attr("transform","translate("+x+","+y+") scale("+style.scale+") rotate("+style.rotate+")");
	if (style.cursor) _xlink.style("cursor",style.cursor);
	if (style.opacity) _xlink.style("opacity",style.opacity);
	if (style.visibility) _xlink.style("visibility",style.visibility);

	return _xlink;
}


//_drawText(svg,"text",100,100,1,{"weight":bold,"color":"blue","anchor":"end"})

function _drawText(svg,text,x,y,style){
	if (!style.style) style.style="normal";
	if (!style.anchor) style.anchor="start";
	if (!style.rotate) style.rotate=0;
	if (!style.scale) style.scale=1;

	var _text = svg.append("text")
	.text(text)
	.style("font-style",style.style)
	.style("text-anchor",style.anchor)
 	.attr("transform","translate ("+x+","+y+") scale("+style.scale+") rotate("+style.rotate+")");

    if (style.color) _text.style("fill",style.color);
	if (style.size) _text.style("font-size",style.size);
    if (style.weight) _text.style("font-weight",style.weight);
    if (style.opacity) _text.style("opacity",style.opacity);
    if (style.mode) _text.style("writing-mode","tb");
    if (style.css) _text.attr("class",style.css);

    return _text;
}




/**
    This function attempts to create a new svg "text" element, chopping
     it up into "tspan" pieces, if the caption is too long
    => expects a text element and will add the tspans accordingly !
*/
function textarea(svg,caption, x, y,maxChars,lineHeight) {
	if (!maxChars) maxChars = 20;
	if (!lineHeight) lineHeight = 12;

	var words = caption.split(" ");
	var line = "";

	for (var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + " ";
		if (testLine.length > maxChars || words[n]=="|")
		{
			svg.append("tspan")
			.attr("x",x)
			.attr("y",y)
			.text(line);

			if (words[n]=="|") words[n]="";

			line = words[n] + " ";
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	svg.append("tspan")
	.attr("x",x)
	.attr("y",y)
	.text(line);
}

/** generic line draw helper method
 * @markers array ["start","end"]
 * @class css reference
 * */
function _drawLine(svg,x1,y1,x2,y2,css,markers){
	var _line = svg.append("line")
	  .attr("x1",x1)
	  .attr("y1",y1)
	  .attr("x2",x2)
	  .attr("y2",y2)
	  .attr("class",css);
	 if (markers){
		_addLineMarkers(_line,markers);
	 }
	 return _line;
}

/** generic line draw helper method
 * @markers array ["start","end"]
 * @class css reference
 * */
function _drawCircle(svg,x,y,r,css){
	var _circle = svg.append("circle")
	  .attr("cx",x)
	  .attr("cy",y)
	  .attr("r",r)

	  .attr("class",css);
	 return _circle;
}


/**
 * rect helper
 */
function _drawRect(svg,x,y,width,height,css){
	var _rect = svg.append("rect")
	  .attr("x",x)
	  .attr("y",y)
	  .attr("width",width)
	  .attr("height",height)
	  .attr("class",css);
	 return _rect;
}


function _addLineMarkers(svg,markers){
	for (var i in markers){
		if (markers[i]["start"]) svg.attr("marker-start", "url(#"+markers[i]["start"]+")");
		if (markers[i]["end"]) svg.attr("marker-end", "url(#"+markers[i]["end"]+")");
	}
}
