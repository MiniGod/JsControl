// Shows a chat message with the players nickname once someone connects.
// Written extra "large"; so it should be easy understandable.

var admin = require('./admin.js');

exports.Init = function(core) {
	// Check if admin plugin is loaded.
	if (!core.isPluginLoaded('admin.js')) {
		console.log(' !> Plugin [admin.js] is not loaded, which is required.');
		return false;
	}
	// Bind the onPlayerConnect event to the playerConnect function in this script
	core.onPlayerConnect(playerConnect);
	core.onRulesScriptCallback(function(core, params) {
		//console.log(params[0], params[1]);
	});
	return true;
}

function playerConnect(core, params) {
 	// param[0] = login
 	// param[1] = isSpectator

 	// Get detailed player info, contains player nickname. - Once received, the detailedInfoReceived function is fired.
 	core.callMethod('GetDetailedPlayerInfo', [params[0]], detailedInfoReceived);
}

function detailedInfoReceived(core, params) {
	// param[0] = struct with detailed player info

	// Figure out if player is admin/operator.
	var rank = "";
	if (admin.isAdmin(params[0]['Login']))
		rank = " (admin)";
	else if (admin.isOperator(params[0]['Login']))
		rank = " (operator)";
	// Send a chat message (no callback needed) with the greet.
	core.callMethod('ChatSendServerMessage', ['$z$o$fff» $z'+params[0]['NickName']+"$z$i$s$08f"+rank+"$o connected to the server."])
}