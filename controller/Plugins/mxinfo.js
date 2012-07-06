// Plugin to fetch data from mania-exchange.com at init and map loading.
// Also shows usage of the ui utility to display a manialink UI

var http = require('http');
var ui = require('../Util/ui.js');

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
	var client = http.createClient(80, 'api.mania-exchange.com');
	var request = client.request("GET", '/tm/tracks/'+uid, {'user-agent': 'NodeJS XMLRPC', 'Content-Type': 'application/json'});
	request.addListener('response', function (response) {
	    response.setEncoding('binary') 
	    var body = '';

	    response.addListener('data', function (chunk) {
	        body += chunk;
	    });
	    response.addListener('end', function () {
	        console.log('MX data received!');
	        try {
	        	var data = JSON.parse(body)[0];
	        	var ml = new ui.Manialink('1000');
	        	var frame = new ui.Frame('64 42 0');
	        	var label1 = new ui.Label('0 0 0', '$sAwards: $o'+data['AwardCount']);
	        	label1.halign = 'right';
	        	label1.scale = 0.75;
	        	var label2 = new ui.Label('0 -2 0', '$sComments: $o'+data['CommentCount']);
	        	label2.halign = 'right';
	        	label2.scale = 0.75;
	        	var label3 = new ui.Label('0 -4 0', '$sMX id: $o$l[http://tm.mania-exchange.com/s/tr/'+data['TrackID']+']'+data['TrackID']+'$l');
	        	label3.halign = 'right';
	        	label3.scale = 0.75;
	        	frame.addItem(label1);
	        	frame.addItem(label2);
	        	frame.addItem(label3);
	        	ml.addItem(frame);
	        	core.callMethod('SendDisplayManialinkPage', [ml.getText(), 0, false])
	        } catch (error) {
	        	console.log('Failed to update MX data. ('+error+')');
	        }
	    });
	});

	request.end();
}