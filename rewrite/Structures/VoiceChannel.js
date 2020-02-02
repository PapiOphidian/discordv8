"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const ServerChannel = require("./ServerChannel");
const Cache = require("../Util/Cache");
const ArgumentRegulariser = require("../Util/ArgumentRegulariser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VoiceChannel extends ServerChannel {
	constructor(data, client, server) {
		super(data, client, server);
		this.members = data.members || new Cache();
		this.userLimit = data.user_limit || 0;
		this._bitrate = data.bitrate || 64000; // incase somebody wants to access the bps value???
		this.bitrate = Math.round(this._bitrate / 1000); // store as kbps
	}

	toObject() {
		let obj = super.toObject();

		obj.userLimit = this.userLimit;
		obj.bitrate = this.bitrate;
		obj.members = this.members.map(member => member.toObject());

		return obj;
	}

	join(callback = function () {}) {
		return this.client.joinVoiceChannel.apply(this.client, [this, callback]);
	}

	setUserLimit() {
		return this.client.setChannelUserLimit.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}

	setBitrate() {
		return this.client.setChannelBitrate.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}
}
module.exports = VoiceChannel;
