// Plugin to fetch data from mania-exchange.com at init and map loading.
// Also shows usage of the ui utility to display a manialink UI

var http = require('http');
var ui = require('../Util/ui.js');

exports.Init = function(core) {
	core.onStatusChanged(statusChanged);
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		getMxData(core, params[0]['UId']);
	});
	return true;
}

function statusChanged(core, params) {
	if (params[0] != 4) // Playing
		return;
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		getMxData(core, params[0]['UId']);
	});
}

function getMxData(core, uid) {
	var options = {
		host: 'api.mania-exchange.com',
		port: 80,
		path: '/sm/maps/'+uid,
		headers: {'user-agent': 'NodeJS XMLRPC', 'Content-Type': 'application/json'}
	}
	http.get(options, function (response) {
	    response.setEncoding('binary') 
	    var body = '';

	    response.on('data', function (chunk) {
	        body += chunk;
	    });
	    response.on('end', function () {
	        try {
	        	var data = JSON.parse(body)[0];
				if (data == undefined) {
					core.callMethod('ChatSendServerMessage', ['$z$o$fff» $i$s$08fMX Data: This track is not on MX.']);
					core.callMethod('SendDisplayManialinkPage', [ui.getEmpty('1000'), 0, false]);
				} else {
					var ml = new ui.Manialink('1000');
					var frame = new ui.Frame('63.5 42 0');
					var label1 = new ui.Label('0 0 0', '$sRating: $o'+data['Rating']+'/5');
					label1.halign = 'right';
					label1.scale = 0.75;
					var label2 = new ui.Label('0 -2 0', '$sComments: $o'+data['CommentCount']);
					label2.halign = 'right';
					label2.scale = 0.75;
					var label3 = new ui.Label('0 -4 0', '$sMX id: $o$l[http://sm.mania-exchange.com/s/tr/'+data['MapID']+']'+data['MapID']+'$l');
					label3.halign = 'right';
					label3.scale = 0.75;
					frame.addItem(label1);
					frame.addItem(label2);
					frame.addItem(label3);
					ml.addItem(frame);
					core.callMethod('SendDisplayManialinkPage', [ml.getText(), 0, false]);
					core.callMethod('ChatSendServerMessage', ['$z$o$fff» $i$s$08fMX Data: $o$8bf$i$l[http://tm.mania-exchange.com/s/tr/'+data['MapID']+'](view on MX)$i$l - '+data['Rating']+'/5 rating, '+data['CommentCount']+' comments.']);
				}
		    } catch (error) {
	        	console.log('Failed to update MX data. ('+error+')');
	        }
	    });
	});
}