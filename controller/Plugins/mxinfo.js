// Plugin to fetch data from mania-exchange.com at init and map loading.
var http = require('http');

exports.Init = function(core) {
	core.onBeginMap(beginMap);
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		getMxData(core, params[0]['UId']);
	});
	return true;
}

function beginMap(core, params) {
	getMxData(core, params[0]['UId']);
}

function getMxData(core, uid) {
	var client = http.createClient(80, 'tm.mania-exchange.com');
	var request = client.request("GET", '/api/tracks/get_track_info/uid/'+uid+'?format=json', {'user-agent': 'NodeJS XMLRPC'});
	request.addListener('response', function (response) {
	    response.setEncoding('binary') 
	    var body = '';

	    response.addListener('data', function (chunk) {
	        body += chunk;
	    });
	    response.addListener('end', function () {
	        console.log('MX data received!');
	        try {
	        	var data = JSON.parse(body);
	        	core.callMethod('ChatSendServerMessage', ['$z$o$s$08fMX Data: $o$l[http://tm.mania-exchange.com/s/tr/'+data['TrackID']+'](view on MX)$l - '+data['AwardCount']+' awards, '+data['CommentCount']+' comments.']);
	        } catch (error) {
	        	console.log('Failed to parse MX data. ===> '+body);
	        }
	    });
	});

	request.end();
}