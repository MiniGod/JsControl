var net = require('net');
var serializer = require('./Lib/serializer.js');
var deserializer = require('./Lib/deserializer.js');
var fs = require('fs');
var stream = require('stream');

if (!fs.existsSync(__dirname + '/Plugins/')) {
	console.log('Error: ./Plugins/ not found.');
	return;
}

if (!fs.existsSync(__dirname + '/config.js')) {
	console.log('Error: ./config.js not found.');
	return;
}

var loadedPlugins = [];
var loadedPluginNames = [];

delete require.cache['./config.js'];
var config = require('./config.js', true);

var connection = net.createConnection(config.Port, config.Ip);

connection.on('data', function(data) {
	var slice = data.slice(4, data.length);

	// Handshake. This is the first request and resonse.
	// This controller isn't designed for the old protocol, but anyway ...
	if(slice.toString() == 'GBXRemote 2')
	{
		// Set the protocol version.
		this.protocol = 2;

		console.log(' > Protocol: ' + slice.toString());
		// Load all plugins now...
		console.log('==== Authing ====');
		var pass = '';
		for (var i = config.Password.length - 1; i >= 0; i--)
			pass += '*';
		console.log(' > Authing as: '+config.User+'/'+pass);
		// Send a new api version already
			// Auth to the server, the protocol was received
		core.callMethod('Authenticate', [config.User, config.Password], function() {
			core.callMethod('SetApiVersion', ['2011-10-06'], function() {
				// We can clear all manialinks now to start fresh
				core.callMethod('SendHideManialinkPage', []);
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
				core.callMethod('EnableCallbacks', [true]);
				// Enable timer for onEverySecond event
				setInterval(function() {
					callbackHandle(corePrivate._onEverySecondCallbacks, []);
				}, 1000)
			});
		});
		// Bind onEverySecond for a stack push, in case some request failed so the queue just goes on with a delay.
		core.onEverySecond(function(core, params) {
			corePrivate.callUpdate();
		});
	}

	else
	{
		// Process everything else.
		getResult(data);
	}
});

// Error.
connection.on('error', function(error) {
	console.log(' ! Error: ' + error);
});

// Close.
connection.on('close', function(isError) {
	if (isError)
		console.log(' ! Connection to the remote server has been closed because of an error.');
	else
		console.log(' ! Connection to the remote server has been closed.');
});

// Timeout.
connection.on('timeout', function() {
	console.log(' ! Connection to the remote server timed out.');
});

// Connect.
connection.on('connect', function() {
	console.log(' > Connected succesfully, waiting for protocol...');
});

// Core object, this will be shared with all plugins at every callback.
var core = {
	callMethod: function(name, params, callback, errorCallback) {
		// Add to queue
		if (!errorCallback) errorCallback = undefined;
		corePrivate._methodQueue.push([name, params, callback, errorCallback]);
		corePrivate.callUpdate();
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
	// Method handlers
	_handleId: 0x80000000,
	_methodCallbacks: {},
	_methodErrorCallbacks: {},
	_methodQueue: [],
	_methodTime: 0,
	callUpdate: function() {
		if (this._methodQueue.length == 0) // Nothing to update
			return;
		var time = (new Date()).getTime();
		if (this._methodTime == 0 || this._methodTime + 500 < time)
		{
			var req = this._methodQueue[0];
			this._methodQueue.splice(0, 1);
			this.callMethod(req[0], req[1], req[2], req[3]);
		}
	},
	callMethod: function(name, params, callback, errorCallback) {
		var xml = serializer.serializeMethodCall(name, params);
		//console.log(xml);
		corePrivate._handleId++;

		var messageBytes = new Buffer(xml);
		var sizeBytes = new Buffer(4);
		var handleBytes = new Buffer(4);
		
		sizeBytes.writeUInt32LE(messageBytes.length, 0);
		handleBytes.writeUInt32LE(corePrivate._handleId, 0);
		
		var sendBuffer = new Buffer(messageBytes.length + sizeBytes.length + handleBytes.length);
		sizeBytes.copy(sendBuffer, 0, 0, sizeBytes.length); // Copy.
		handleBytes.copy(sendBuffer, 4, 0, handleBytes.length); // Copy.
		messageBytes.copy(sendBuffer, 8, 0, messageBytes.length); // Copy.

		// Set callbacks
		if (callback)
			corePrivate._methodCallbacks[corePrivate._handleId] = callback;
		if (errorCallback)
			corePrivate._methodErrorCallbacks[corePrivate._handleId] = errorCallback;
		
		// Write message to socket. UTF-8 encoding.
		connection.write(sendBuffer, 'utf8');
	},
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

var xml = '';
var isReading = false;
var recHandle = 0;
var size = 0;
var bytesLeft = 0;
var buffer = new Buffer(0);

function getResult(data) {
	var message;
	buffer = new Buffer(0);
	if (isReading == false) {
		// New call
		isReading = true;
		size = 0;
		bytesLeft = 0;
		recHandle = 0;

		size = data.slice(0, 4).readUInt32LE(0); // Size.
		bytesLeft = size;

		recHandle = data.slice(4, 8).readUInt32LE(0); // Handle.

		if (data.length-8 > bytesLeft) { // If so, another call comes right after
			buffer = data.slice(bytesLeft+8, data.length);
			xml = data.slice(8,bytesLeft+8).toString('utf8');
		} else
			xml = data.slice(8,data.length).toString('utf8');
		bytesLeft -= data.length-8;
	} else {
		if (data.length > bytesLeft) { // If so, another call comes right after
			buffer = data.slice(bytesLeft, data.length);
			xml += data.slice(0, bytesLeft).toString('utf8'); 
		} else
			xml += data.slice(0, data.length).toString('utf8');
		bytesLeft -= data.length;
	}

	if (size == 0 || size > 4096*1024 || recHandle == 0)
	{
		console.log('Transport error: Handle:'+recHandle)
		console.log('  Buffer size: '+buffer.length)
		console.log('  Data size  : '+size)
		console.log('  Bytes left : '+bytesLeft)
		console.log('  XML size   : '+xml.length)
		// start over in case of weirdness
		xml = '';
		isReading = false;
		return;
	}
	
	if (bytesLeft > 0) // Only a part of the message is received, waiting for the rest...
		return;

	var desil = new deserializer();
	desil.deserialize(xml, function(error, result) {
		if((recHandle & 0x80000000) == 0) // Callback. 
		{
			if (error != undefined) {
				console.log('[ERROR] (XMLRPC Parse)')
				console.log('[ERROR] Received data: '+xml)
				throw error;
				return;
			}
			// Call functions in plugins
			switch (result['methodName']) {
				case 'ManiaPlanet.PlayerConnect':
				    callbackHandle(corePrivate._onPlayerConnectCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.PlayerDisconnect':
				    callbackHandle(corePrivate._onPlayerDisconnectCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.PlayerChat':
				    callbackHandle(corePrivate._onPlayerChatCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.PlayerManialinkPageAnswer':
				    callbackHandle(corePrivate._onPlayerManialinkPageAnswerCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.Echo':
				    callbackHandle(corePrivate._onEchoCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.ServerStart':
				    callbackHandle(corePrivate._onServerStartCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.ServerStop':
				    callbackHandle(corePrivate._onServerStopCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.BeginMatch':
				    callbackHandle(corePrivate._onBeginMatchCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.EndMatch':
				    callbackHandle(corePrivate._onEndMatchCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.BeginMap':
				    callbackHandle(corePrivate._onBeginMapCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.EndMap':
				    callbackHandle(corePrivate._onEndMapCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.BeginRound':
				    callbackHandle(corePrivate._onBeginRoundCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.EndRound':
				    callbackHandle(corePrivate._onEndRoundCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.StatusChanged':
				    callbackHandle(corePrivate._onStatusChangedCallbacks, result['params']);
				    break;
				case 'TrackMania.PlayerCheckpoint':
				    callbackHandle(corePrivate._onPlayerCheckpointCallbacks, result['params']);
				    break;
				case 'TrackMania.PlayerFinish':
				    callbackHandle(corePrivate._onPlayerFinishCallbacks, result['params']);
				    break;
				case 'TrackMania.PlayerIncoherence':
				    callbackHandle(corePrivate._onPlayerIncoherenceCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.BillUpdated':
				    callbackHandle(corePrivate._onBillUpdatedCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.TunnelDataReceived':
				    callbackHandle(corePrivate._onTunnelDataReceivedCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.MapListModified':
				    callbackHandle(corePrivate._onMapListModifiedCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.PlayerInfoChanged':
				    callbackHandle(corePrivate._onPlayerInfoChangedCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.ManualFlowControlTransition':
				    callbackHandle(corePrivate._onManualFlowControlTransitionCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.VoteUpdated':
				    callbackHandle(corePrivate._onVoteUpdatedCallbacks, result['params']);
				    break;
				case 'ManiaPlanet.RulesScriptCallback':
				case 'ManiaPlanet.ModeScriptCallback':
				    callbackHandle(corePrivate._onRulesScriptCallbackCallbacks, result['params']);
				    break;
				default:
					console.log('Unhandled callback: ' + result['methodName']);
			}
		} else { // Method response
			// Instantly call next item in queue
			corePrivate._methodTime = 0;
			corePrivate.callUpdate();
			// Callback
			if (error == undefined) {
				if (corePrivate._methodCallbacks[recHandle] != undefined)
					corePrivate._methodCallbacks[recHandle](core, result['params']);
			} else if (corePrivate._methodErrorCallbacks[recHandle] != undefined)
				corePrivate._methodErrorCallbacks[recHandle](core, error);
			return;
		}
	});
	xml = '';
	isReading = false;
	// If some data is in the buffer, do it again..
	if (buffer.length > 0)
		getResult(buffer);
};

function callbackHandle(funcs, params) {
	for (i in funcs)
		funcs[i](core, params);
}

process.on('uncaughtException', function(err) {
    console.log("[Error]", err);
    console.log("       ", err.stack);
});