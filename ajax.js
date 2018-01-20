
// Get your own API key from https://uwaterloo.ca/api/register
var apiKey = 'a491b5c26c972cf297306d11368a1103';

function time() {
	var d = new Date();
	return d.toTimeString() + " (" + d.getSeconds() + "." + d.getMilliseconds() + ")";
}

$(function() {

	if (apiKey === '') {
		document.write("You need an API key.");
	}
	$("#out").append("<p>Data is accurate as of time " + time() + "</p>");

/*
	$.getJSON("https://api.uwaterloo.ca/v2/courses/CS.json?key=" + apiKey,
			function (d) {
				$("#out").append("<p>Web service returned at " + time() + "</p>");
				$("#out").append("<pre>" + JSON.stringify(d, null, 3) + "</pre>");
			});


	$("#out").append("<p>After calling the web service at " + time() + "</p>");
*/
});
