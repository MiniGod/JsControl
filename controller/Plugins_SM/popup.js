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
	return true;
}

exports.