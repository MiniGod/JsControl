var config = {};

/////////////////////////////////////////////////////
////// MySQL config                            //////
/////////////////////////////////////////////////////

// Almost always localhost, as you should run the database at the same system as the controller does.
config.Ip		= 'localhost'
// MySQL port, by default 3306
config.Port 	= 3306
// Username
config.User		= 'root'
// Password
config.Password	= ''
// Database name
config.Database	= 'jscontrol'



module.exports = config;