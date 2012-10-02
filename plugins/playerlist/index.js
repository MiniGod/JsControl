var Player;

var PlayerList = function(core) {
	this.query = core.query;

	this.players = {};

	core.on('ManiaPlanet.PlayerConnect', this.connect.bind(this));
	core.on('ManiaPlanet.PlayerDisconnect', this.disconnect.bind(this));
	core.on('ManiaPlanet.PlayerInfoChanged', this.changed.bind(this));
}

PlayerList.prototype.run = function() {
	// Has to delay the loading of ./player until run(),
	// because ./player calls requirePlugin('playerlist')
	// Which kinda fucks stuff up
	Player = require('./player');

	var self = this;
	this.query('GetPlayerList', [-1, 0, 1], function (err, res) {
		res.forEach(function(player, i) {
			self.players[player.Login] = new Player(player);
		});
		
		// Parse flags after - so that Player.spectator.target wont fail
		res.forEach(function(player, i) {
			self.players[player.Login].parse();
		});
	});
};

PlayerList.prototype.connect = function(params) {
	console.log('CONNECT', params[0]);
	var player = new Player();
	this.players[params[0]] = player;

	this.query('GetPlayerInfo', params[0], function(err, res) {
		if (!err) player.update(res);
		else delete player;
	});
};

PlayerList.prototype.disconnect = function(params) {
	console.log('DISCONNECT', params[0]);
	// Delete on next tick, in case some plugins wants to `get` first.
	var self = this;
	process.nextTick(function() {
		delete self.players[params[0]];
	});
};

PlayerList.prototype.changed = function(params) {
	console.log('Changed...', params[0].Login);
	var p;
	if (p = this.get(params[0].Login)) {
		p.update(params[0]);
	}
};

/**
 * Returns an object of players, or one player if login is set
 * @param  {String|Integer} login Optional Login or id of player
 * @return {Object|Player|Boolean} An object of Player or one Player or false if fail
 */
PlayerList.prototype.get = function(login) {
	// If no login - return the whole list
	if (!login)
		return this.players;
	// If string - assume its a login
	else if (typeof login == 'string')
		return this.players.hasOwnProperty(login) ? this.players[login] : false;
	// If number - assume its an id
	else if (typeof login == 'number')
		for (var l in this.players)
			if (this.players.hasOwnProperty(l) && this.players[l].id == login)
				return this.players[l];
			else
				;//console.log("get()", this.players[l].id, login);

	return false;
};

module.exports = PlayerList;