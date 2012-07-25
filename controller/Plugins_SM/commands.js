var admin = require('./admin.js');
var panel = require('./panel.js');
var commands = {};
var commandshelp = {};
commandshelp[0] = {}; // normal
commandshelp[1] = {}; // operator
commandshelp[2] = {}; // admin

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
		var param = params[2].substring(d[0].length+2);
		var level = 0;
		if (admin.isOperator(params[1]))
			level = 1;
		if (admin.isAdmin(params[1]))
			level = 2;
		var sendNoPermission = true;
		for (i in commands[d[0]]) {
			if (level >= commands[d[0]][i][1]) {
				sendNoPermission = false;
				commands[d[0]][i][0](core, params[1], param);
			}
		}
		if (sendNoPermission)
			core.callMethod('ChatSendServerMessageToLogin', ['$z$o$fff» $o$i$s$f44No permission to run this command.', params[1]]);
	});
	
	exports.onCommand('help', showCommands, 0, "List all commands with help");
	
	return true;
}

exports.onCommand = function(command, callback, opLevel, helptext) {
	if (commands[command] == undefined)
		commands[command] = [];
	if (!opLevel) opLevel = 0;
	commands[command].push([callback, opLevel]);
	if (!helptext) helptext = "";
	commandshelp[opLevel][command] = helptext;
	return false;
}

function showCommands(core, login, param) {
	var level = 0;
	if (admin.isOperator(login))
		level = 1;
	if (admin.isAdmin(login))
		level = 2;
	list = [];
	for (cmd in commandshelp[0])
		list.push(['/'+cmd, commandshelp[0][cmd]]);
	if (level >= 1)
		for (cmd in commandshelp[1])
			list.push(['/'+cmd+' $i(OP)', commandshelp[1][cmd]]);
	if (level >= 2)
		for (cmd in commandshelp[2])
			list.push(['/'+cmd+' $i(AD)', commandshelp[2][cmd]]);
	panel.ShowList(core, login, {subject: 'Commands list and help', columns_widths: [0.4, 0.6], columns_names: ['Command', 'Info']}, list, 20);
}