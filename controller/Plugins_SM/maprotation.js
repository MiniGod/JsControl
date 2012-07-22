var cmd = require('./commands.js');

exports.Init = function(core) {
	// Check if admin plugin is loaded.
	if (!core.isPluginLoaded('commands.js')) {
		console.log(' !> Plugin [commands.js] is not loaded, which is required.');
		return false;
	}

	return true;
}