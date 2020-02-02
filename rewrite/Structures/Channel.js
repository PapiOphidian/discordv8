"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const Equality = require("../Util/Equality");
const ArgumentRegulariser = require("../Util/ArgumentRegulariser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Channel extends Equality {
	constructor(data, client) {
		super();
		this.id = data.id;
		this.client = client;
	}

	get createdAt() {
		return new Date(+this.id / 4194304 + 1420070400000);
	}

	get isPrivate() {
		return !this.server;
	}

	delete() {
		return this.client.deleteChannel.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}
}
module.exports = Channel;
