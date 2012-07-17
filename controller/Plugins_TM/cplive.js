// Plugin to fetch data from mania-exchange.com at init and map loading.
// Also shows usage of the ui utility to display a manialink UI

var ui = require('../Util/ui.js');
var formatting = require('../Util/formatters.js');

var CheckpointCount = 0;
var Players = {};
var TicksSinceUpdate = 0;
var NeedUpdate = false;

exports.Init = function(core) {
	core.onBeginMap(function (core, params) {
		CheckpointCount = params[0]['NbCheckpoints']-1;
	});
	core.onBeginRound(function (core, params) {
		Reset(core);
	});
	core.onPlayerFinish(function (core, params) {
		if (Players[params[1]] == undefined)
			return; // player data not found
		if (params[2] == 0) {
			Players[params[1]][1] = '0';
			Players[params[1]][2] = '0:00.000';
		} else {
			Players[params[1]][1] = 'F';
			Players[params[1]][2] = formatting.FormatTime(params[2]);
		}
		NeedUpdate = true;
	});
	core.onPlayerCheckpoint(function (core, params) {
		if (Players[params[1]] == undefined)
			return; // player data not found
		Players[params[1]][1] = params[4]+1;
		Players[params[1]][2] = formatting.FormatTime(params[2]);
		NeedUpdate = true;
	});
	core.callMethod('GetCurrentMapInfo', [], function(core, params) {
		CheckpointCount = params[0]['NbCheckpoints']-1;
		Reset(core);
	});
	core.onEndMatch(function(core, params) {
		core.callMethod('SendDisplayManialinkPage', [ui.getEmpty('1002'), 0, false]);
	});
	core.onPlayerConnect(function(core, params) {
		core.callMethod('GetDetailedPlayerInfo', [params[0]], function(core, params) {
			Players[params[0]['Login']] = [params[0]['NickName'], 0, '0:00.000'];
			NeedUpdate = true;
		});
	});
	core.onEverySecond(function(core, params) {
		TicksSinceUpdate += 1;
		if (TicksSinceUpdate > 3 && NeedUpdate) {
			UpdateUI(core);
			NeedUpdate = false;
			TicksSinceUpdate = 0;
		}
	});
	return true;
}

function Reset(core) {
	Players = {};
	core.callMethod('GetPlayerList', [100, 0], function(core, params) {
		for (i in params[0]) {
			Players[params[0][i]['Login']] = [params[0][i]['NickName'], 0, '0:00.000'];
		}
		UpdateUI(core);
	});
}

function UpdateUI(core) {
	var ml = new ui.Manialink('1002');
	var frame = new ui.Frame('-64 42 0');
	var labela = new ui.Label('0 1.5 0', '$o$s$08fCPLive');
	labela.scale = 0.75;
	frame.addItem(labela);
	var labelb = new ui.Label('15 1 0', 'Total CPs: '+CheckpointCount);
	labelb.scale = 0.5;
	labelb.halign = 'right';
	frame.addItem(labelb);
	var i = 0;
	for (p in Players) {
		var frame2 = new ui.Frame('0 '+(i*-3.1)+' 0');
		var quad = new ui.Quad('-1 0 0', '17 3', 'BgsPlayerCard', 'BgActivePlayerName');
		var label1 = new ui.Label('0.5 -0.1 0', Players[p][0]);
		label1.scale = 0.75;
		label1.size2 = '17 0';
		var label2 = new ui.Label('0.5 -1.6 0', '$s'+Players[p][2]);
		label2.scale = 0.5;
		var label3 = new ui.Label('15.7 -0.4 0', '$s$o'+Players[p][1]);
		label3.halign = 'right';
		frame2.addItem(quad);
		frame2.addItem(label1);
		frame2.addItem(label2);
		frame2.addItem(label3);
		frame.addItem(frame2);
		i++;
	}
	ml.addItem(frame);
	core.callMethod('SendDisplayManialinkPage', [ml.getText(), 0, false])
}