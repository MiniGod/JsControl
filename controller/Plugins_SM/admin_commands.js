var fs = require('fs');
var url = require('url');
var http = require('http');

var cmd = require('./commands.js');

var mapdir = "";

exports.Init = function(core) {
	// Check if admin plugin is loaded.
	if (!core.isPluginLoaded('commands.js')) {
		console.log(' !> Plugin [commands.js] is not loaded, which is required.');
		return false;
	}
	// Store maps directory already
	core.callMethod('GetMapsDirectory', [], function(core, params) {
		mapdir = params[0];
		if (!fs.existsSync(mapdir+'MX/')) // Create MX directory
			fs.mkdirSync(mapdir+'MX/');
	});
	// Bind events via cmd
	cmd.onCommand('add', addMap, 2);
	cmd.onCommand('remove', removeMap, 2);
	cmd.onCommand('removethis', removeThisMap, 2);
	cmd.onCommand('skip', skipMap, 1);
	cmd.onCommand('restart', restartMap, 1);
	
	return true;
}

function addMap(core, login, param) {
	if(isNaN(param)) {
		core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$f44Paramer is not a valid number ('+param+').', login]);
		return;
	}

	var options = {
		host: 'sm.mania-exchange.com',
		port: 80,
		path: '/maps/download/'+param,
		headers: {'user-agent': 'NodeJS XMLRPC', 'Content-Type': 'application/json'}
	}
	http.get(options, function (response) {
		if (response.statusCode == 301) {
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$4f4Track id does not exist on MX.', login]);
			return;
		}
		if (response.statusCode != 200) {
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$4f4Failed downloading map data. Error: '+response.statusCode, login]);
			return;
		}
		var filename = (response.headers['content-disposition'].substring(22, (response.headers['content-disposition'].length-1))); // So clean!
		//var filename = "attachment; filename=\"Battle - \"FirePractice.Map.Gbx\"".match(/(filename=")(.*?)(")/);
		//console.log(filename);
		//return;
		var stream = fs.createWriteStream(mapdir+'MX/'+filename);
		response.addListener('data', function (chunk) {
			stream.write(chunk);
		});
		response.addListener('end', function () {
			stream.end();
			core.callMethod('InsertMap', [mapdir+'MX/'+filename]);
			core.callMethod('SaveMatchSettings', ['maps.MatchSettings.txt']);
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$4f4Map '+filename+" added!", login]);
		});
	});
}

function removeMap(core, login, param) {
	mapExists(core, param, function(exists) {
		console.log(exists);
		if (!exists) {
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$4f4File not found, could not remove map.', login]);
		} else {
			core.callMethod('RemoveMap', [param], function() {
				core.callMethod('SaveMatchSettings', ['maps.MatchSettings.txt']);
				core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$4f4Map succesfully removed: '+param, login]);
			});
		}
	});
}

function removeThisMap(core, login, param) {
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		removeMap(core, login, params[0]['FileName']);
	});
}

function skipMap(core, login, param) {
	core.callMethod('NextMap', [], function() {
		core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $i$s$4f4An operator skipped this map.', login]);
	});
}

function restartMap(core, login, param) {
	core.callMethod('RestartMap', [], function() {
		core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $i$s$4f4An operator restarted this map.', login]);
	});
}

function mapExists(core, filename, callback) {
	core.callMethod('GetMapList', [1000, 0], function(core, params) {
		for (i in params[0]) {
			if (params[0][i]['FileName'] == filename) {
				callback(true);
				return;
			}
		}
		callback(false);
	});
}
