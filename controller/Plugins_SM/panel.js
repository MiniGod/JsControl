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
		if (pdata[params[1]] == undefined)
			return;
		var num = Number(params[2])
		if (num == NaN) return;
		if (num <= 100 || num >= 998) return;
		if (pdata[params[1]].type == "list") {
			var row = Math.floor((num-100)/10);
			var col = num-row*10-100;
			if (pdata[params[1]].settings.callbacks == undefined || pdata[params[1]].settings.callbacks[col] == undefined)
				return;
			var data = pdata[params[1]].pages[pdata[params[1]].page][row];
			if (data == undefined) return;
			pdata[params[1]].settings.callbacks[col](core, params[1], data);
		}
	});
	core.onPlayerDisconnect(function(core, params) {
		delete pdata[params[0]]; // Clear from cache
	});
	return true;
}

exports.ShowList = function(core, login, settings, lines, pagelimit) {
	var current = 0;
	pdata[login] = {type: 'list', settings: settings, pages: [], page: 0, pagelimit: pagelimit};
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
	if (settings.callbacks == undefined) settings.callbacks = [];
	var height = 1;
	var ml = new ui.Manialink('1');
	var panel = new ui.Frame('80 90 0');
	//var quad = new ui.Quad('0 0 0', '80 40', 'BgsPlayerCard', 'BgActivePlayerName');
	var quad = new ui.Quad('0 0 5', '80 180', '', '');
	quad.bgcolor = "0008";
	//var quad2 = new ui.Quad('0 0 0', '80 40', 'Bgs1', 'BgTitleShadow');
	
	if (settings.subject != undefined) {
		var subject = new ui.Label('40 -2 7', '$z$s$fff$o'+settings.subject);
		subject.halign = 'center';
		panel.addItem(subject);
		var line = new ui.Quad('0 -0.5 6', '80 6', '', '');
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
			spacings.push(settings.columns_widths[i]*width+spacings[spacings.length-1]);
			widths.push(settings.columns_widths[i]*width);
		}
	}
	
	if (settings.columns_names != undefined) {
		if (settings.columns_names.constructor != Array)
			settings.columns_names = [settings.columns_names];
		var w_depth = 0;
		for (i in settings.columns_names) {
			var column = new ui.Label(spacings[w_depth]+' '+height+' 7', '$ccc$s'+settings.columns_names[i], 'TextCardInfoSmall');
			column.halign = 'left';
			//column.scale = 1;
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
			if (widths[w_depth] == undefined || widths[w_depth] == 0) 
				continue;
			var column = new ui.Label(spacings[w_depth]+' '+height+' 7', lines[i][j]);
			column.halign = 'left';
			column.size2 = widths[w_depth]/0.85+' 0';
			if (settings.callbacks[j] != null) {
				column.style = "TextCardSmallScores2";
				column.action = (100+Number(j)+Number(i)*10);
			} else {
				column.scale = 0.8;
			}
			panel.addItem(column);
			w_depth += 1;
		}
		//panel.addItem(new ui.Quad('0.5 '+(height+0.1)+' 1', '79 4', 'Bgs1', 'BgList'));
		var line = new ui.Quad('0 '+(height+0.3)+' 6', '80 4.5', '', '');
		line.bgcolor = "8883";
		panel.addItem(line);
		height -= 5;
	}

	var close = new ui.Quad('72 1.5 7', '10 10', 'Icons64x64_1', 'QuitRace');
	close.action = '100';
	close.actionkey = '4';
	panel.addItem(close);
	var closel = new ui.Label('77 -5.5 7', '$z$fff$s(F8)');
	closel.halign = 'center';
	closel.scale = 0.6;
	closel.action = '100';
	closel.actionkey = '4';
	panel.addItem(closel);
	
	if (settings.paging) {
		var prev = new ui.Quad('0 '+height+' 7', '6 6', 'Icons64x64_1', 'ShowLeft2');
		prev.action = '998';
		prev.actionkey = '2';
		panel.addItem(prev);
		var prevl = new ui.Label('4 '+(height-1.5)+' 7', '$z$fff$o$sPrevious (F6)');
		prevl.scale = 0.8;
		panel.addItem(prevl);
		
		var next = new ui.Quad('74 '+height+' 7', '6 6', 'Icons64x64_1', 'ShowRight2');
		next.action = '999';
		next.actionkey = '3';
		panel.addItem(next);
		var nextl = new ui.Label('76 '+(height-1.5)+' 7', '$z$fff$o$sNext (F7)');
		nextl.scale = 0.8;
		nextl.halign = 'right';
		panel.addItem(nextl);
		
		if (settings.totalpages == undefined) settings.totalpages = 1;
		if (settings.currentpage == undefined) settings.currentpage = 1;
		var page = new ui.Label('40 '+(height-1.7)+' 7', '$z$fff$o$s'+settings.currentpage+'/'+settings.totalpages);
		page.halign = 'center';
		panel.addItem(page);
	}


	panel.addItem(quad);
	ml.addItem(panel);
	core.callMethod('SendDisplayManialinkPageToLogin', [login, ml.getText(), 0, false]);
}