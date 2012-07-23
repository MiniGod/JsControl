var cmd = require('./commands.js');
var con = require('./database.js').connection;

exports.Init = function(core) {
	// Check if admin plugin is loaded.
	if (!core.isPluginLoaded('commands.js')) {
		console.log(' !> Plugin [commands.js] is not loaded, which is required.');
		return false;
	}
	// Check if admin db is loaded.
	if (!core.isPluginLoaded('database.js')) {
		console.log(' !> Plugin [database.js] is not loaded, which is required.');
		return false;
	}
	
	core.onStatusChanged(statusChanged);
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		mapChanged(core, params[0]);
	});

	return true;
}

function statusChanged(core, params) {
	if (params[0] != 4) // Playing
		return;
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		mapChanged(core, params[0]);
	});
}

function mapChanged(core, mapdata) {
	con.query('SELECT * FROM maps WHERE uid=\''+mapdata['UId']+'\'', function(err, rows, fields) {
		if (err) throw err;
		if (rows.length == 0)
			con.query('INSERT INTO maps SET ?', {name: mapdata['Name'], uid: mapdata['UId'], author: mapdata['Author']});
	});
}