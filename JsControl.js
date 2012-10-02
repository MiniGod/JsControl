/*
 * This file just does some checks before it starts JsControl it self...
 */

var fs = require('fs');

if (!fs.existsSync(__dirname + '/Plugins/')) {
	console.error('Error: ./Plugins/ not found.');
	return;
}

if (!fs.existsSync(__dirname + '/config/config.json')) {
	console.error('Error: ./config.js not found.');
	return;
}

require('./controller/controller.js');