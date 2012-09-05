// Plugin to fetch data from mania-exchange.com at init and map loading.
// Also shows usage of the ui utility to display a manialink UI

var ui = require('../Util/ui.js');
var formatting = require('../Util/formatters.js');

var CheckpointCount = 0;

exports.Init = function(core) {
	core.onBeginMap(function (core, params) {
		CheckpointCount = params[0]['NbCheckpoints']-1;
		UpdateUI(core, 0);
	});
	core.onBeginRound(function (core, params) {
		UpdateUI(core, 0);
	});
	core.onPlayerFinish(function (core, params) {
		if (params[2] == 0) 
			UpdateUI(core, 0, params[1]);
		else 
			UpdateUI(core, '$9ffF$fff', params[1]);
	});
	core.onPlayerCheckpoint(function (core, params) {
		if (params[4] == CheckpointCount) 
			return; // will be handled by onPlayerFinish
		UpdateUI(core, params[4]+1, params[1]);
	});
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		CheckpointCount = params[0]['NbCheckpoints']-1;
		UpdateUI(core, 0);
	});
	core.onPlayerConnect(function (core, params) {
		UpdateUI(core, 0, params[0]);
	});
	core.onEndMatch(endMatch);
	return true;
}

function endMatch(core, params) {
	core.callMethod('SendDisplayManialinkPage', [ui.getEmpty('1001'), 0, false]);
}

function UpdateUI(core, count, login) {
	var ml = new ui.Manialink('1001');
	var frame = new ui.Frame('0 -40 0');
	var label1 = new ui.Label('0 0 0', '$s$fff$o'+count+'/'+CheckpointCount);
	label1.halign = 'center';
	var label2 = new ui.Label('0 1 0', '$s$8bfCheckpoints');
	label2.halign = 'center';
	label2.scale = 0.6;
	frame.addItem(label1);
	frame.addItem(label2);
	ml.addItem(frame);

	if (!login)
		core.callMethod('SendDisplayManialinkPage', [ml.getText(), 0, false]);
	else
		core.callMethod('SendDisplayManialinkPageToLogin', [login, ml.getText(), 0, false]);
}