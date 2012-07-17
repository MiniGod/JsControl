var admins = [];
var operators = [];

exports.Init = function(core) {
	var config = require('../config_admin.js');
	admins = config.admins;
	operators = config.operators;
	console.log('   * '+admins.length+' admins and '+operators.length+' operators found.');
	return true;
}

exports.isAdmin = function(login) {
	for (key in admins)
		if (admins[key] == login)
			return true;
	return false;
}

exports.isOperator = function(login, ignoreAdminList) {
	if (!ignoreAdminList && exports.isAdmin(login))
		return true;
	for (key in operators)
		if (operators[key] == login)
			return true;
	return false;
}