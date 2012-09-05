var config = {};

/////////////////////////////////////////////////////
////// General config to connect to the server //////
/////////////////////////////////////////////////////

// IP of your server, if you run the controller on the same machine as the server this should usually be 127.0.0.1
config.Ip		= '127.0.0.1'
// XML-RPC port of your server, by default 5000
config.Port		= 5000;
// SuperAdmin username
config.User		= 'SuperAdmin'
// SuperAdmin password
config.Password	= 'SuperAdmin'


/////////////////////////////////////////////////////
////// Plugins to load                         //////
/////////////////////////////////////////////////////

config.plugins = [];
// To add a plugin, add the plugin into the Plugins folder, then reference it here.
// Referencing should be done using the file's filename, including extension (.js).
//   config.plugins.push('FILENAME.js');

config.plugins.push('database.js');
config.plugins.push('panel.js');
config.plugins.push('admin.js');
config.plugins.push('commands.js');
config.plugins.push('maprotation.js');
config.plugins.push('admin_commands.js');
config.plugins.push('greet.js');
config.plugins.push('mxinfo.js');


module.exports = config;