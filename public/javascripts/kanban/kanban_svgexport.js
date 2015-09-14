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

    if (!css) css="/stylesheets/space.css";

	// 1) load css
	$.ajax({
		'url': css,
		'dataType':'text',
			crossDomain:true,
		'success':function(data){

		// 2) wrap into CDATA
		var _injectCSS ="<style type=\"text/css\"><![CDATA["+data+"]]></style>";
		//console.log("_injectCSS = "+_injectCSS);

		// 3) and inject via jquery

		//_clone.append("style").attr("type","text/css").append(_injectCSS);
		//d3.select("svg").append("style").attr("type","text/css").append(_injectCSS);
		$( _injectCSS).insertAfter( "defs" );

		console.log("submit downloadform called: format = "+output_format);


		// Get the d3js SVG element
		var svg = document.getElementsByTagName("svg")[0];


		//console.log("**********svg: "+svg);

		//need a clone
		//var _clone = _.clone(svg);
		//console.log("**********_clone: "+_clone);


		// Extract the data as SVG text string
		var svg_xml = (new XMLSerializer).serializeToString(svg);
		//console.log("**********"+svg_xml);

		//var svg_xml="<svg xmlns=\"http://www.w3.org/2000/svg\"  height=\"210\" width=\"500\"><line x1=\"0\" y1=\"0\" x2=\"200\" y2=\"200\" style=\"stroke:rgb(255,0,0);stroke-width:2\" /> </svg>";

		$.ajax({
			type: 'POST',
			data: {svg:svg_xml},
			dataType: "json",
      //contentType: 'text/plain',
			crossDomain:true,
			url: TRANSCODE_URL+"?context="+CONTEXT+"&format="+output_format+"&width=1000&height=1000&scale=1"

		});

		}
	});
}


// button handlers
$("#show_svg_code").click(function() { show_svg_code(); });
$("#save_as_svg").click(function() { submit_download_form("svg"); });
$("#save_as_pdf").click(function() { submit_download_form("pdf"); });
$("#save_as_png").click(function() { submit_download_form("png"); });
$("#input_transcode_url").val(TRANSCODE_URL)	;
$("#b99").click(function() { TRANSCODE_URL = document.getElementById("input_transcode_url").value });
