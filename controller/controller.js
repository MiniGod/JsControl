var VERSION = '0.1.1'

// Packages
  , gbxremote = require('gbxremote')
  , fs = require('fs')
  ;

var Core = function() {
	console.log(' ####################');
	console.log(' # JsControl v%s #', VERSION);
	console.log(' ####################\n');

	var self = this;
	
	this.config = require('../config/config.json');
	this.plugins =  {};
	
	// Connect to the server
	this.connect();
	
	// Load plugins when connected connect
	this.once('connect', function() {
		self.loadPlugins();
		
		// If an uncaught exception happens after the plugins has
		// been loaded, don't kill the controller!
		process.on('uncaughtException', function(err) {
			console.log("*********************************************");
			console.log("[Error]", err);
			console.log("       ", err.stack);
			console.log("*********************************************");
		});
	});
};

// Inherit EventEmitter
Core.prototype = Object.create(require('events').EventEmitter.prototype);

/**
 * Connects and authenticates, and then fires `connect` when done.
 */
Core.prototype.connect = function() {
	var self = this;

	console.log('Connecting to %s:%d', this.config.ip, this.config.port);
	this.client = gbxremote.createClient(this.config.port, this.config.ip);
	
	this.client.on('connect', function() {
		
		// Dump info about the connected server...
		// TODO: Set API, then do this... and then enable callbacks and emit connect.... or? and auth somewhere in there.
		self.client.query('GetVersion', function(err, res) {
			console.log('Connected to %s@%s v%s - build %s - API: %s\n', res.Name, res.TitleId, res.Version, res.Build, res.ApiVersion);
		});

		self.client.query('Authenticate', [self.config.user, self.config.pass], function(err, res) {
			if (res == true) {
				// Use latest API version
				self.client.query('SetApiVersion', '2012-06-19');
				// Enable callbacks
				self.client.query('EnableCallbacks', true);
				// Ready now
				self.emit('connect');
			} else {
				throw "Could not authenticate. Wrong user or pass?";
			}
		});
	});

	this.client.on('error', function (err) {
		console.log(err.stack);
	});

	this.client.on('close', function(wasError) {
		if (wasError)
			console.log(' ! Connection to the server has been closed due to an error.');
		else
			console.log(' ! Connection to the server has been closed.');

		// Make sure node shuts down. (setTimeout will for instance keep node alive)
		process.exit();
	});
};

/**
 * Loads all the plugins listed in the config file
 */
Core.prototype.loadPlugins = function() {
	console.log('Loading plugins...');

	// Remember the plugins that failed, and inform at end
	var failed = [];
	if (this.config.plugins.length > 0) {

		// Load the plugins
		for (i in this.config.plugins) {
			if (!this.loadPlugin(this.config.plugins[i])) {
				failed.push(this.config.plugins[i]);
			}
		}

		// If any plugins failed to load, inform the user.
		if (failed.length > 0) {
			console.log('*******');
			console.log('These plugins failed to load:');
			console.log(failed.join(', '));
			console.log('*******');
		} else {
			console.log('All plugins loaded');
		}

		console.log('');
	}

	if (this.config.plugins.length == 0 || failed.length == this.config.plugins.length) {
		console.log('No plugins!');
		console.log('Exiting...');
		setTimeout(process.exit, 1000);
		return;
	}

	// Now call the .run function of the loaded plugins
	
	for (var name in this.plugins)
		if (this.plugins.hasOwnProperty(name))
			this.plugins[name].run();
};

/**
 * Loads the plugin `name`
 * @param name {String} Filename or foldername of name
 * @returns {Boolean} true if plugin loaded successfully, or if it has already been loaded. Otherwise false.
 */
Core.prototype.loadPlugin = function(name) {
	// Remove .js from plugin name.
	name = name.replace(/\.js$/i, '');

	// If the plugin has been loaded already, just return true
	if (this.plugins.hasOwnProperty(name))
		return true;
	
	try {
		var plugin = require('../plugins/' + name);
		if (typeof plugin === 'function') {
			console.log(' > Load plugin:', name);

			var configPath = __dirname + '/../config/plugins/' + name + '.json';

			// Have to bind `this.client` to the on and query functions. dno why... kinda weird
			var self = this;
			
			var fakeCore = {
				config: fs.existsSync(configPath) ? require(configPath) : {},
				on: function() {
					self.client.on.apply(self.client, arguments);
				},
				query: function() {
					self.client.query.apply(self.client, arguments);
				}
			};

			this.plugins[name] = new plugin(fakeCore);

			return true;
		}
	} catch (err) {
		console.log(err);
		console.log(err.stack);
		if (err.code == 'MODULE_NOT_FOUND') {
			// Plugins not found!
			//console.log(' Load plugin: %s  -- NOT FOUND', name);
		}
	}

	return false;
};

/**
 * Returns the instance of the plugin
 * Throws error if the plugin is not loaded, or does not load successfully.
 * @param plugin {string} Filename or foldername of plugin
 * @returns instance of plugin
 */
Core.prototype.requirePlugin = function(plugin) {
	// Remove .js
	plugin = plugin.replace(/\.js$/i, '');

	// Load plugin if not loaded, or fail to load
	if (this.loadPlugin(plugin)) {
		return this.plugins[plugin];
	} else {
		throw new Error('Plugin `' + plugin + '` is not installed');
	}
};

/**
 * Global alias of `Core.prototype.requirePlugin`.
 * @returns the instance of the plugin @see Core.prototype.requirePlugin(plugin)
 */
GLOBAL.requirePlugin = function() {
	return Core.prototype.requirePlugin.apply(core, arguments);
}

/**
 * Global alias of `core.client.query`.
 */
GLOBAL.query = function() {
	return core.client.query.apply(core.client, arguments);
}

// Start everything...
var core = new Core();
