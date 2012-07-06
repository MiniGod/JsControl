// Shows a chat message with the players nickname once someone connects.
// Written extra "large"; so it should be easy understandable.

exports.Init = function(core) {
	// Bind the onPlayerConnect event to the playerConnect function in this script
	core.onPlayerConnect(playerConnect)
	return true;
}

function playerConnect(core, params) {
 	// param[0] = login
 	// param[1] = isSpectator

 	// Get detailed player info, contains player nickname. - Once received, the detailedInfoReceived function is fired.
 	core.callMethod('GetDetailedPlayerInfo', [params[0]], detailedInfoReceived)
}

function detailedInfoReceived(core, params) {
	// param[0] = struct with detailed player info

	// Send a chat message (no callback needed) with the greet.
	core.callMethod('ChatSendServerMessage', ['$z'+params[0]['NickName']+"$z$s$fff connected to the server."])
}