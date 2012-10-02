var 
	PlayerList = requirePlugin('playerlist');

var Player = function(info) {
	// Default
	this.login = this.nick = '';
	this.id = this.team = this.spectator = this.ladder = this.flags = 0;

	if (info) this.update(info);
}

Player.prototype.update = function(info) {
	this.login = info.Login;
	this.nick = info.NickName;
	this.id = info.PlayerId;
	this.team = info.TeamId;
	this.spectator = info.SpectatorStatus;
	this.ladder = info.LadderRanking;
	this.flags = info.Flags;

	// Parse spectator and flags
	this.parse();
};

Player.prototype.parse = function() {
	// Parse the spectator flags
	if (this.spectator !== 0 && typeof this.spectator === 'number') {
		// Split every number into an array
		var spec = this.spectator.toString().split('');

		this.spectator = {
			spectator: !!parseInt(spec.pop()),
			temporarySpectator: !!parseInt(spec.pop()),
			pureSpectator: !!parseInt(spec.pop()),
			autoTarget: !!parseInt(spec.pop()),
			currentTargetId: parseInt(spec.join('')),
			target: false
		}

		this.spectator.target = this.spectator.currentTargetId ? PlayerList.get(this.spectator.currentTargetId) : false;
	}

	// Parse flags
	if (this.flags !== 0 && typeof this.flags === 'number') {
		// Split every number into an array
		var fl = this.flags.toString().split('');

		this.flags = {
			forceSpectator: !!parseInt(fl.pop()),
			isReferee: !!parseInt(fl.pop()),
			isPodiumReady: !!parseInt(fl.pop()),
			isUsingStereoscopy: !!parseInt(fl.pop()),
			isManagedByAnOtherServer: !!parseInt(fl.pop()),
			isServer: !!parseInt(fl.pop()),
			hasPlayerSlot: !!parseInt(fl.pop())
		}
	}
};

/**
 * Kick the player
 * @param  {String} message Optional kick message
 */
Player.prototype.kick = function(message) {
	query('Kick', message ? [this.login, message] : this.login);
	return this;
};

/**
 * Ban the player
 * @param  {String} message Optional ban message
 */
Player.prototype.ban = function(message) {
	query('Ban', message ? [this.login, message] : this.login);
	return this;
};

/**
 * UnBan the player
 */
Player.prototype.unBan = function(message) {
	query('Ban', this.login);
	return this;
};
// Alias
Player.prototype.unban = Player.prototype.unBan;

/**
 * Force a player to become spectator
 * @param {Integer} mode 0: user selectable, 1: spectator, 2: player
 */
Player.prototype.spectator = function(mode) {
	query('Ban', this.login);
};


module.exports = Player;