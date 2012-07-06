// Pretty much a test for the time formatter, displays the players time once he finishes.
var formatters = require('../Util/formatters.js');

exports.Init = function(core) {
	core.onPlayerFinish(onFinish);
	return true;
}

function onFinish(core, params) {
	if (params[2] == 0) // respawn
		return;
	core.callMethod('ChatSendServerMessage', ['$o$i$s$ff0Player '+params[1]+' finished; time: '+formatters.FormatTime(params[2])+'.']);
}