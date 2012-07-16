// Pretty much a test for the time formatter, displays the players time once he finishes.
var formatters = require('../Util/formatters.js');

var playerNickNames = {};

exports.Init = function(core) {
	core.onPlayerFinish(onFinish);
	core.onPlayerDisconnect(onDisconnect);
	return true;
}

function onFinish(core, params) {
	if (params[2] == 0) // respawn
		return;
	var time = formatters.FormatTime(params[2]);
	// Check if nickname is into memory..
	if (playerNickNames[params[1]] == undefined) {
		core.callMethod('GetDetailedPlayerInfo', [params[1]], function(core, params) {
			playerNickNames[params[0]['Login']] = params[0]['NickName'];
			core.callMethod('ChatSendServerMessage', ['$z$o$fff» $i$s$08fPlayer $z'+params[0]['NickName']+'$z$o$i$s$08f finished; time: '+time+'.']);
		});
	} else
		core.callMethod('ChatSendServerMessage', ['$z$o$fff» $i$s$08fPlayer $z'+playerNickNames[params[1]]+'$z$o$i$s$08f finished; time: '+time+'.']);
}

function onDisconnect(core, params) {
	delete playerNickNames[params[0]]; // Clear nickname from memory, as he left (if it exists)
}