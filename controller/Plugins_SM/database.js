// Plugin to fetch data from mania-exchange.com at init and map loading.
// Also shows usage of the ui utility to display a manialink UI

var mysql = require('mysql');

exports.Init = function(core) {
	var config = require('../config_database.js');
	exports.connection = mysql.createConnection({
	  host     : config.Ip,
	  port     : config.Port,
	  user     : config.User,
	  password : config.Password,
	  database : config.Database,
	});
	exports.connection.connect();
	return true;
}