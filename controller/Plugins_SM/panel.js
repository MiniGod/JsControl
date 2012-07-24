var ui = require('../Util/ui.js');

// Popup mID's:
// 1: Screen
// Popup aID's:
// 100: Close
// Popup aID's (List):
// 101: Row 1, Column 1
// 102: Row 1, Column 2
// 121: Row 2, Column 1
// ...
// 998: Previous
// 999: Next

var pdata = {};

exports.Init = function(core) {
	core.onPlayerManialinkPageAnswer(function(core, params) {
		if (params[2] == '100') {
			core.callMethod('SendDisplayManialinkPageToLogin', [params[1], ui.getEmpty('1'), 0, false]);
			delete pdata[params[1]]; // Clear from cache
		} else if (params[2] == '998') {
			if (pdata[params[1]] == undefined)
				return;
			if (pdata[params[1]].type == 'list') {
				// Previous page
				if (pdata[params[1]].page == 0)
					return;
				pdata[params[1]].page -= 1;
				pdata[params[1]].settings.currentpage = pdata[params[1]].page+1;
				exports.Show(core, params[1], pdata[params[1]].settings, pdata[params[1]].pages[pdata[params[1]].page]);
			}
		} else if (params[2] == '999') {
			if (pdata[params[1]] == undefined)
				return;
			if (pdata[params[1]].type == 'list') {
				// Next page
				if (pdata[params[1]].page == pdata[params[1]].pages.length-1)
					return;
				pdata[params[1]].page += 1;
				pdata[params[1]].settings.currentpage = pdata[params[1]].page+1;
				exports.Show(core, params[1], pdata[params[1]].settings, pdata[params[1]].pages[pdata[params[1]].page]);
			}
		}
	});
	core.onPlayerDisconnect(function(core, params) {
		delete pdata[params[0]]; // Clear from cache
	});
	return true;
}

exports.ShowList = function(core, login, settings, lines, pagelimit) {
	var current = 0;
	pdata[login] = {type: 'list', settings: settings, pages: [], page: 0};
	settings.paging = true;
	settings.totalpages = 0;
	while (current < lines.length) {
		pdata[login].pages.push(lines.slice(current, current+pagelimit));
		current += pagelimit;
		settings.totalpages += 1;
	}
	exports.Show(core, login, settings, pdata[login].pages[0]);
}

exports.Show = function(core, login, settings, lines) {
	if (settings == undefined) settings = {};
	var height = 1;
	var ml = new ui.Manialink('1');
	var panel = new ui.Frame('80 90 0');
	//var quad = new ui.Quad('0 0 0', '80 40', 'BgsPlayerCard', 'BgActivePlayerName');
	var quad = new ui.Quad('0 0 0', '80 180', '', '');
	quad.bgcolor = "0008";
	//var quad2 = new ui.Quad('0 0 0', '80 40', 'Bgs1', 'BgTitleShadow');
	
	if (settings.subject != undefined) {
		var subject = new ui.Label('40 -1.5 2', '$z$s$fff$o'+settings.subject);
		subject.halign = 'center';
		panel.addItem(subject);
		var line = new ui.Quad('0 -0.5 1', '80 6', '', '');
		line.bgcolor = "8888";
		panel.addItem(line);
		height -= 10;
	}
	
	var width = 78;
	var spacings = [1];
	var widths = [];
	if (settings.columns_widths != undefined) {
		if (settings.columns_widths.constructor != Array)
			settings.columns_widths = [settings.columns_widths];
		for (i in settings.columns_widths) {
			spacings.push(settings.columns_widths[i]*width+1);
			widths.push(settings.columns_widths[i]*width);
		}
	}
	
	if (settings.columns_names != undefined) {
		if (settings.columns_names.constructor != Array)
			settings.columns_names = [settings.columns_names];
		var w_depth = 0;
		for (i in settings.columns_names) {
			var column = new ui.Label(spacings[w_depth]+' '+height+' 2', '$ccc$s'+settings.columns_names[i], 'TextCardInfoSmall');
			column.halign = 'left';
			column.scale = 0.8;
			column.size2 = widths[w_depth]+' 0';
			panel.addItem(column);
			w_depth += 1;
		}
		height -= 5;
	}
	
	for (i in lines) {
		if (lines[i].constructor != Array)
			lines[i] = [lines[i]];
		var w_depth = 0;
		for (j in lines[i]) {
			var column = new ui.Label(spacings[w_depth]+' '+height+' 2', lines[i][j]);
			column.halign = 'left';
			column.size2 = widths[w_depth]+' 0';
			column.scale = 0.8;
			panel.addItem(column);
			w_depth += 1;
		}
		//panel.addItem(new ui.Quad('0.5 '+(height+0.1)+' 1', '79 4', 'Bgs1', 'BgList'));
		var line = new ui.Quad('0 '+(height+0.3)+' 1', '80 4.5', '', '');
		line.bgcolor = "8883";
		panel.addItem(line);
		height -= 5;
	}
	
	var prev = new ui.Quad('0 '+height+' 2', '6 6', 'Icons64x64_1', 'ShowLeft2');
	prev.action = '998';
	prev.actionkey = '2';
	panel.addItem(prev);
	var prevl = new ui.Label('4 '+(height-1.5)+' 2', '$z$fff$o$sPrevious (F6)');
	prevl.scale = 0.8;
	panel.addItem(prevl);
	
	var next = new ui.Quad('74 '+height+' 2', '6 6', 'Icons64x64_1', 'ShowRight2');
	next.action = '999';
	next.actionkey = '3';
	panel.addItem(next);
	var nextl = new ui.Label('76 '+(height-1.5)+' 2', '$z$fff$o$sNext (F7)');
	nextl.scale = 0.8;
	nextl.halign = 'right';
	panel.addItem(nextl);
	
	var close = new ui.Quad('72 1.5 2', '10 10', 'Icons64x64_1', 'QuitRace');
	close.action = '100';
	close.actionkey = '4';
	panel.addItem(close);
	var closel = new ui.Label('77 -5.5 2', '$z$fff$s(F8)');
	closel.halign = 'center';
	closel.scale = 0.6;
	closel.action = '100';
	closel.actionkey = '4';
	panel.addItem(closel);
	
	if (settings.totalpages == undefined) settings.totalpages = 1;
	if (settings.currentpage == undefined) settings.currentpage = 1;
	var page = new ui.Label('40 '+(height-1.7)+' 2', '$z$fff$o$s'+settings.currentpage+'/'+settings.totalpages);
	page.halign = 'center';
	panel.addItem(page);


	panel.addItem(quad);
	//panel.addItem(quad2);
	ml.addItem(panel);
	core.callMethod('SendDisplayManialinkPageToLogin', [login, ml.getText(), 0, false]);
	//core.callMethod('SendDisplayManialinkPageToLogin', [login, '<?xml version="1.0" encoding="UTF-8" ?><manialink id="2" version="1"><frame posn="-160 60 -60"><quad posn="0 -14 0" sizen="90 106" style="Bgs1InRace" substyle="BgWindow2"/><frame posn="0 0 0.1"><quad posn="-1 0 0" sizen="92 14" style="Bgs1InRace" substyle="BgTitle3_1"/><label posn="45 -7 0.1" sizen="86 7" halign="center" valign="center2" textsize="2.5" textcolor="fff" text="$o3 tracks on $zreabys testing server"/></frame><quad posn="1.5 -7 0.3" sizen="8 8" valign="center" style="Icons64x64_1" substyle="Close" action="61"/><label posn="9 -2.5 0.4" sizen="20 7" style="TextCardRaceRank" action="62" text="$000_"/><frame posn="0 -10 0.6"><quad posn="14.5 -9.5 0" sizen="64.5 5" style="BgsPlayerCard" substyle="BgCardSystem" action="64"/><label posn="6.5 -10.5 0.1" sizen="6.5 3" halign="right" textsize="2" textcolor="000" text="1."/><label posn="15.5 -10.5 0.2" sizen="633" textsize="2" textcolor="000" text="$s$fffRoyal - $f20He$f31ar$f42tB$f53re$f64ak$f75er"/><quad posn="14.5 -15.5 0.3" sizen="64.5 5" style="BgsPlayerCard" substyle="BgCardSystem" action="65"/><label posn="6.5 -16.5 0.4" sizen="6.5 3" halign="right" textsize="2" textcolor="000" text="2."/><label posn="15.5 -16.5 0.5" sizen="63 3" textsize="2" textcolor="000" text="$s$fffRoyal - $f20Me$f31et$f42in$f53gP$f64oi$f75nt"/><quad posn="14.5 -21 0.6" sizen="64.5 6" style="Bgs1InRace" substyle="NavButtonBlink"/><label posn="6.5 -22.5 0.7" sizen="6.5 3" halign="right" textsize="2" textcolor="000" text="3."/><label posn="15.5 -22.5 0.8" sizen="63 3" textsize="2" textcolor="000" text="$s$fffRoyal - $f20Ro$f31ad$f42To$f53No$f64wh$f75er$f86e"/></frame><frame posn="45 -114 1.5"><quad posn="8 0 0" sizen="8 8" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="-8 0 0.1" sizen="8 8" halign="right" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="16 0 0.2" sizen="8 8" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="-16 0 0.3" sizen="8 8" halign="right" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="16 0 0.4" sizen="8 8" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="-16 0 0.5" sizen="8 8" halign="right" valign="center" style="Icons64x64_1" substyle="ClipPause"/><quad posn="0 0 0.6" sizen="16 6" halign="center" valign="center" style="Bgs1" substyle="BgPager"/><label posn="0 0 0.7" sizen="14 7" halign="center" valign="center2" style="TextValueSmall" text="1 / 1"/></frame><label posn="3 -15.5 2.3" sizen="10 4" textsize="2" textcolor="000" text="$oId"/><label posn="15 -15.5 2.4" sizen="55 4" textsize="2" textcolor="000" text="$oName"/></frame></manialink>', 0, false]);
}