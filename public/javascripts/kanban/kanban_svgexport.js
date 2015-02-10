/*
   Utility function: populates the <FORM> with the SVG data
   and the requested output format, and submits the form.
*/
function submit_download_form(output_format,css)
{
	//var declaration ="kanbanv2.css";
	
	/* we have to inline the css into a CDATA section in the svg in order to do correct transcoding with RSVG
	
	 <style type="text/css" >
      <![CDATA[

        circle {
           stroke: #006600;
           fill:   #00cc00;
        }

      ]]>
    </style>
    
    1) load css '/stylesheets/kanbanv2.css'
    2) wrap css into <![CDATA[ ---css--- ]]>  block
    3) d3.select("#Layer_1").append("style").attr("type","text/css")
    4) inject that 
    
    
    
    
    
    
    */
    
    if (!css) css="/stylesheets/kanbanv2.css";
	
	// 1) load css
	$.ajax({
		'url': css,
		'dataType':'text',
		'success':function(data){
				
		// 2) wrap into CDATA
		var _injectCSS ="<![CDATA["+data+"]]>";
		console.log("_injectCSS = "+_injectCSS);	
		
		// 3) and inject via d3
		
		//_clone.append("style").attr("type","text/css").append(_injectCSS);
		//d3.select("svg").append("style").attr("type","text/css").append(_injectCSS);
	
		
		
		console.log("submit downloadform called: format = "+output_format);	
		

		// Get the d3js SVG element
		var svg = document.getElementsByTagName("svg")[0];
		console.log("**********svg: "+svg);
		
		//need a clone
		var _clone = _.clone(svg);
		console.log("**********_clone: "+_clone);
		
		
		// Extract the data as SVG text string
		var svg_xml = (new XMLSerializer).serializeToString(svg);
		//console.log("**********"+svg_xml);
		
		
		
		var form = document.getElementById("svgform");
		
		//console.log(declaration+svg_xml);
		form.action=TRANSCODE_URL;
		form["format"].value = output_format;
		form["data"].value = svg_xml ;
		//form["data"].value = svg_xml ;
		form["context"].value = CONTEXT;
		form["svg_width"].value = WIDTH ;
		form["svg_height"].value = HEIGHT ;
		//high res scale
		form["png_scale"].value = 3 ;
		console.log("*going to submit to "+TRANSCODE_URL);
		
		form.submit();
			
			}
});

}

// button handlers
$("#show_svg_code").click(function() { show_svg_code(); });
$("#save_as_svg").click(function() { submit_download_form("svg"); });
$("#save_as_pdf").click(function() { submit_download_form("pdf"); });
$("#save_as_png").click(function() { submit_download_form("png"); });
if (document.getElementById("input_transcode_url")) document.getElementById("input_transcode_url").value = TRANSCODE_URL;
$("#b99").click(function() { TRANSCODE_URL = document.getElementById("input_transcode_url").value });

