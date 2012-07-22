var admin = require('./admin.js');
var commands = {};

exports.Init = function(core) {
	// Check if admin plugin is loaded.
	if (!core.isPluginLoaded('admin.js')) {
		console.log(' !> Plugin [admin.js] is not loaded, which is required.');
		return false;
	}
	core.onPlayerChat(function(core, params) {
		if (params[2].substring(0, 1) != '/')
			return;
		var d = params[2].substring(1).split(' ', 2);
		if (commands[d[0]] == undefined) {
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$f44Command not found.', params[1]]);
			return;
		}
		var level = 0;
		if (admin.isOperator(params[1]))
			level = 1;
		if (admin.isAdmin(params[1]))
			level = 2;
		var sendNoPermission = true;
		for (i in commands[d[0]]) {
			if (level >= commands[d[0]][i][1]) {
				sendNoPermission = false;
				commands[d[0]][i][0](core, params[1], d[1]);
			}
		}
		if (sendNoPermission)
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$f44No permission to run this command.', params[1]]);
	});
	return true;
}

exports.onCommand = function(command, callback, opLevel) {
	if (commands[command] == undefined)
		commands[command] = [];
	if (!opLevel) opLevel = 0;
	commands[command].push([callback, opLevel]);
	return false;
}
