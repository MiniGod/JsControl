var gbxremote = require('gbxremote');
var fs = require('fs');

if (!fs.existsSync(__dirname + '/Plugins/')) {
	console.error('Error: ./Plugins/ not found.');
	return;
}

if (!fs.existsSync(__dirname + '/config.js')) {
	console.error('Error: ./config.js not found.');
	return;
}

var loadedPlugins = [];
var loadedPluginNames = [];

var config = require('./config.js', true);

var client = gbxremote.createClient(config.Port, config.Ip);

client.on('connect', function() {
	// Load all plugins now...
	console.log('==== Authing ====');
	var pass = '';
	for (var i = config.Password.length - 1; i >= 0; i--)
		pass += '*';
	console.log(' > Authing as: '+config.User+'/'+pass);
	// Send a new api version already
	// Auth to the server, the protocol was received
	client.query('Authenticate', [config.User, config.Password], function(err, res) {
		if (res == true) {
			// Since we authenticated successfully, the answer from these
			// queries doesnt matter. It should work! (Unless human error)
			client.query('SetApiVersion', ['2012-06-19']); // Updated the API version
			// We can clear all manialinks now to start fresh
			client.query('SendHideManialinkPage');
			
			// Auth done, start loading all plguins and call their export.Init function.
			console.log('==== Reading plugins ====');
			for (pid in config.plugins) {
				console.log(' > Loading '+config.plugins[pid]+'...');
				var plugin = require('./Plugins/'+config.plugins[pid]);
				if (plugin.Init && plugin.Init(core) === true) {
					loadedPlugins.push(plugin);
					loadedPluginNames.push(config.plugins[pid]);
				} else
					console.log(' ! Failed to load plugin '+config.plugins[pid]+'.');
			}
			console.log('==== Loading plugins completed, all set! ====');
			
			// Enable callbacks, all plugins were loaded.
			client.query('EnableCallbacks', [true]);
		}
	});
});

// Error.
client.on('error', function(error) {
	console.error(' ! Error: ' + error);
});

// Close.
/*
client.on('close', function(isError) {
	if (isError)
		console.log(' ! Connection to the remote server has been closed because of an error.');
	else
		console.log(' ! Connection to the remote server has been closed.');
});
*/

// Timeout.
/*
client.on('timeout', function() {
	console.log(' ! Connection to the remote server timed out.');
});
*/

// Core object, this will be shared with all plugins at every callback.
var core = {
	client: client,
	// Deprecate this? make plugins talk directly to `client`?
	callMethod: function(method, params, success, error) {
		client.query(method, params, function(err, res) {
			if (err) { if (error) error(core, err); }
			else { if (success) success(core, [res]); }
		});
	},
	isPluginLoaded: function(fileName) {
		for (key in loadedPluginNames)
			if (loadedPluginNames[key] == fileName)
				return true;
		return false;
	},
	onPlayerConnect: function(callback) { corePrivate._onPlayerConnectCallbacks.push(callback); },
	onPlayerDisconnect: function(callback) { corePrivate._onPlayerDisconnectCallbacks.push(callback); },
	onPlayerChat: function(callback) { corePrivate._onPlayerChatCallbacks.push(callback); },
	onPlayerManialinkPageAnswer: function(callback) { corePrivate._onPlayerManialinkPageAnswerCallbacks.push(callback); },
	onEcho: function(callback) { corePrivate._onEchoCallbacks.push(callback); },
	onServerStart: function(callback) { corePrivate._onServerStartCallbacks.push(callback); },
	onServerStop: function(callback) { corePrivate._onServerStopCallbacks.push(callback); },
	onBeginMatch: function(callback) { corePrivate._onBeginMatchCallbacks.push(callback); },
	onEndMatch: function(callback) { corePrivate._onEndMatchCallbacks.push(callback); },
	onBeginMap: function(callback) { corePrivate._onBeginMapCallbacks.push(callback); },
	onEndMap: function(callback) { corePrivate._onEndMapCallbacks.push(callback); },
	onBeginRound: function(callback) { corePrivate._onBeginRoundCallbacks.push(callback); },
	onEndRound: function(callback) { corePrivate._onEndRoundCallbacks.push(callback); },
	onStatusChanged: function(callback) { corePrivate._onStatusChangedCallbacks.push(callback); },
	onPlayerCheckpoint: function(callback) { corePrivate._onPlayerCheckpointCallbacks.push(callback); },
	onPlayerFinish: function(callback) { corePrivate._onPlayerFinishCallbacks.push(callback); },
	onPlayerIncoherence: function(callback) { corePrivate._onPlayerIncoherenceCallbacks.push(callback); },
	onBillUpdated: function(callback) { corePrivate._onBillUpdatedCallbacks.push(callback); },
	onTunnelDataReceived: function(callback) { corePrivate._onTunnelDataReceivedCallbacks.push(callback); },
	onMapListModified: function(callback) { corePrivate._onMapListModifiedCallbacks.push(callback); },
	onPlayerInfoChanged: function(callback) { corePrivate._onPlayerInfoChangedCallbacks.push(callback); },
	onManualFlowControlTransition: function(callback) { corePrivate._onManualFlowControlTransitionCallbacks.push(callback); },
	onVoteUpdated: function(callback) { corePrivate._onVoteUpdatedCallbacks.push(callback); },
	onRulesScriptCallback: function(callback) { corePrivate._onRulesScriptCallbackCallbacks.push(callback); },
	onEverySecond: function(callback) { corePrivate._onEverySecondCallbacks.push(callback); }
};

// Core object, but not shared with plugins
var corePrivate = {
	// Callback handlers
	_onPlayerConnectCallbacks: [],
	_onPlayerDisconnectCallbacks: [],
	_onPlayerChatCallbacks: [],
	_onPlayerManialinkPageAnswerCallbacks: [],
	_onEchoCallbacks: [],
	_onServerStartCallbacks: [],
	_onServerStopCallbacks: [],
	_onBeginMatchCallbacks: [],
	_onEndMatchCallbacks: [],
	_onBeginMapCallbacks: [],
	_onEndMapCallbacks: [],
	_onBeginRoundCallbacks: [],
	_onEndRoundCallbacks: [],
	_onStatusChangedCallbacks: [],
	_onPlayerCheckpointCallbacks: [],
	_onPlayerFinishCallbacks: [],
	_onPlayerIncoherenceCallbacks: [],
	_onBillUpdatedCallbacks: [],
	_onTunnelDataReceivedCallbacks: [],
	_onMapListModifiedCallbacks: [],
	_onPlayerInfoChangedCallbacks: [],
	_onManualFlowControlTransitionCallbacks: [],
	_onVoteUpdatedCallbacks: [],
	_onRulesScriptCallbackCallbacks: [],
	_onEverySecondCallbacks: []

}

/**
 * Proccesses a response.
 *
 * @param {Buffer} data 	- The data from the response.
 */ 

client.on('callback', function(method, params) {
	// Call functions in plugins
	switch (method) {
		case 'ManiaPlanet.PlayerConnect':
		    callbackHandle(corePrivate._onPlayerConnectCallbacks, params);
		    break;
		case 'ManiaPlanet.PlayerDisconnect':
		    callbackHandle(corePrivate._onPlayerDisconnectCallbacks, params);
		    break;
		case 'ManiaPlanet.PlayerChat':
		    callbackHandle(corePrivate._onPlayerChatCallbacks, params);
		    break;
		case 'ManiaPlanet.PlayerManialinkPageAnswer':
		    callbackHandle(corePrivate._onPlayerManialinkPageAnswerCallbacks, params);
		    break;
		case 'ManiaPlanet.Echo':
		    callbackHandle(corePrivate._onEchoCallbacks, params);
		    break;
		case 'ManiaPlanet.ServerStart':
		    callbackHandle(corePrivate._onServerStartCallbacks, params);
		    break;
		case 'ManiaPlanet.ServerStop':
		    callbackHandle(corePrivate._onServerStopCallbacks, params);
		    break;
		case 'ManiaPlanet.BeginMatch':
		    callbackHandle(corePrivate._onBeginMatchCallbacks, params);
		    break;
		case 'ManiaPlanet.EndMatch':
		    callbackHandle(corePrivate._onEndMatchCallbacks, params);
		    break;
		case 'ManiaPlanet.BeginMap':
		    callbackHandle(corePrivate._onBeginMapCallbacks, params);
		    break;
		case 'ManiaPlanet.EndMap':
		    callbackHandle(corePrivate._onEndMapCallbacks, params);
		    break;
		case 'ManiaPlanet.BeginRound':
		    callbackHandle(corePrivate._onBeginRoundCallbacks, params);
		    break;
		case 'ManiaPlanet.EndRound':
		    callbackHandle(corePrivate._onEndRoundCallbacks, params);
		    break;
		case 'ManiaPlanet.StatusChanged':
		    callbackHandle(corePrivate._onStatusChangedCallbacks, params);
		    break;
		case 'TrackMania.PlayerCheckpoint':
		    callbackHandle(corePrivate._onPlayerCheckpointCallbacks, params);
		    break;
		case 'TrackMania.PlayerFinish':
		    callbackHandle(corePrivate._onPlayerFinishCallbacks, params);
		    break;
		case 'TrackMania.PlayerIncoherence':
		    callbackHandle(corePrivate._onPlayerIncoherenceCallbacks, params);
		    break;
		case 'ManiaPlanet.BillUpdated':
		    callbackHandle(corePrivate._onBillUpdatedCallbacks, params);
		    break;
		case 'ManiaPlanet.TunnelDataReceived':
		    callbackHandle(corePrivate._onTunnelDataReceivedCallbacks, params);
		    break;
		case 'ManiaPlanet.MapListModified':
		    callbackHandle(corePrivate._onMapListModifiedCallbacks, params);
		    break;
		case 'ManiaPlanet.PlayerInfoChanged':
		    callbackHandle(corePrivate._onPlayerInfoChangedCallbacks, params);
		    break;
		case 'ManiaPlanet.ManualFlowControlTransition':
		    callbackHandle(corePrivate._onManualFlowControlTransitionCallbacks, params);
		    break;
		case 'ManiaPlanet.VoteUpdated':
		    callbackHandle(corePrivate._onVoteUpdatedCallbacks, params);
		    break;
		case 'ManiaPlanet.RulesScriptCallback':
		case 'ManiaPlanet.ModeScriptCallback':
		    callbackHandle(corePrivate._onRulesScriptCallbackCallbacks, params);
		    break;
		default:
			console.log('Unhandled callback: ' + method);
	}
});

function callbackHandle(funcs, params) {
	for (i in funcs)
		funcs[i](core, params);
}

process.on('uncaughtException', function(err) {
    console.log("[Error]", err);
    console.log("       ", err.stack);
});