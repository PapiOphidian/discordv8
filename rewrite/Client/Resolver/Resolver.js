"use strict";
/* global Buffer */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var fs = require("fs");
var superagent = require("superagent");
var User = require("../../Structures/User");
var Channel = require("../../Structures/Channel");
var TextChannel = require("../../Structures/TextChannel");
var VoiceChannel = require("../../Structures/VoiceChannel");
var ServerChannel = require("../../Structures/ServerChannel");
var PMChannel = require("../../Structures/PMChannel");
var Role = require("../../Structures/Role");
var Server = require("../../Structures/Server");
var Message = require("../../Structures/Message");
var Invite = require("../../Structures/Invite");
var Webhook = require("../../Structures/Webhook");
var VoiceConnection = require("../../Voice/VoiceConnection");

class Resolver {
	constructor(internal) {
		this.internal = internal;
	}

	resolveToBase64(resource) {
		if (resource instanceof Buffer) {
			resource = resource.toString("base64");
			resource = "data:image/jpg;base64," + resource;
		}
		return resource;
	}

	resolveInviteID(resource) {
		if (resource instanceof Invite) {
			// @ts-ignore
			return resource.id;
		}
		if (typeof resource === "string" || resource instanceof String) {
			if (resource.indexOf("http") === 0) {
				var split = resource.split("/");
				return split.pop();
			}
			return resource;
		}
		return null;
	}

	resolveServer(resource) {
		if (resource instanceof Server) {
			return resource;
		}
		if (resource instanceof ServerChannel) {
			return resource.server;
		}
		if (resource instanceof String || typeof resource === "string") {
			return this.internal.servers.get("id", resource);
		}
		if (resource instanceof Message) {
			if (resource.channel instanceof TextChannel) {
				return resource.channel.server;
			}
		}
		return null;
	}

	resolveRole(resource) {
		if (resource instanceof Role) {
			return resource;
		}
		if (resource instanceof String || typeof resource === "string") {
			var role = null;
			for (var server of this.internal.servers) {
				if (role = server.roles.get("id", resource)) {
					return role;
				}
			}
		}
		return null;
	}

	resolveFile(resource) {
		if (typeof resource === "string" || resource instanceof String) {
			// @ts-ignore
			if (/^https?:\/\//.test(resource)) {
				return new Promise((resolve, reject) => {
					// @ts-ignore
					superagent.get(resource).buffer().parse((res, cb) => {
						res.setEncoding("binary");
						res.data = "";
						res.on("data", chunk => {
							res.data += chunk;
						});
						res.on("end", () => {
							cb(null, new Buffer(res.data, "binary"));
						});
					}).end((err, res) => {
						if (err) {
							return reject(err);
						}
						return resolve(res.body);
					});
				});
			} else {
				return Promise.resolve(resource);
			}
		}
		return Promise.resolve(resource);
	}

	resolveMentions(resource, channel) {
		var _mentions = [];
		var changed = resource;
		for (var mention of resource.match(/<@\!?[0-9]+>/g) || []) {
			// username mention
			if (mention[2] === '!') {
				var user = this.internal.users.get("id", mention.substring(3, mention.length - 1));
				if (user) {
					_mentions.push(user);
					var details = channel.server && channel.server.detailsOf(user);
					if (details) {
						changed = changed.replace(new RegExp(mention, "g"), `@${details.nick || user.username + "#" + user.discriminator}`);
					}
				}
			} else {
				var user = this.internal.users.get("id", mention.substring(2, mention.length - 1));
				if (user) {
					_mentions.push(user);
					changed = changed.replace(new RegExp(mention, "g"), `@${user.username + "#" + user.discriminator}`);
				}
			}
		}
		if (channel && channel.server && channel.server.roles) {
			for (var mention of resource.match(/<@&[0-9]+>/g) || []) {
				// role mention
				var role = channel.server.roles.get("id", mention.substring(3, mention.length - 1));
				if (role) {
					changed = changed.replace(new RegExp(mention, "g"), `@${role.name}`);
				}
			}
		}
		for (var mention of resource.match(/<#[0-9]+>/g) || []) {
			// channel mention
			var channel = this.internal.channels.get("id", mention.substring(2, mention.length - 1));
			if (channel) {
				changed = changed.replace(new RegExp(mention, "g"), `#${channel.name}`);
			}
		}
		return [_mentions, changed];
	}

	resolveString(resource) {

		// accepts Array, Channel, Server, User, Message, String and anything
		// toString()-able

		if (resource instanceof Array) {
			resource = resource.join("\n");
		}

		return resource.toString();
	}

	resolveUser(resource) {
		/*
  	accepts a Message, Channel, Server, String ID, User, PMChannel
  */
		if (resource instanceof User) {
			return resource;
		}
		if (resource instanceof Message) {
			return resource.author;
		}
		if (resource instanceof TextChannel) {
			var lmsg = resource.lastMessage;
			if (lmsg) {
				return lmsg.author;
			}
		}
		if (resource instanceof Server) {
			return resource.owner;
		}
		if (resource instanceof PMChannel) {
			return resource.recipient;
		}
		if (resource instanceof String || typeof resource === "string") {
			return this.internal.users.get("id", resource);
		}

		return null;
	}

	resolveWebhook(resource) {
		/*
   accepts a Webhook
   */
		if (resource instanceof Webhook) {
			return Promise.resolve(resource);
		}
		if (resource instanceof String || typeof resource === "string") {
			let server = this.internal.servers.find(s => s.webhooks.has("id", resource));
			if (server) {
				return Promise.resolve(server.webhooks.get("id", resource));
			}
		}
		if (typeof resource === "object" && resource.hasOwnProperty("id") && resource.hasOwnProperty("token")) {
			return Promise.resolve(resource);
		}

		var error = new Error("Could not resolve webhook");
		// @ts-ignore
		error.resource = resource;
		return Promise.reject(error);
	}

	resolveMessage(resource) {
		// accepts a Message, PMChannel & TextChannel

		if (resource instanceof TextChannel || resource instanceof PMChannel) {
			return resource.lastMessage;
		}
		if (resource instanceof Message) {
			return resource;
		}

		return null;
	}

	resolveChannel(resource) {
		/*
  	accepts a Message, Channel, VoiceConnection, Server, String ID, User
  */

		if (resource instanceof Message) {
			return Promise.resolve(resource.channel);
		}
		if (resource instanceof Channel) {
			return Promise.resolve(resource);
		}
		if (resource instanceof VoiceConnection) {
			return Promise.resolve(resource.voiceChannel);
		}
		if (resource instanceof Server) {
			return Promise.resolve(resource.defaultChannel);
		}
		if (resource instanceof String || typeof resource === "string") {
			var user = this.internal.users.get("id", resource);
			if (user) {
				resource = user;
			} else {
				return Promise.resolve(this.internal.channels.get("id", resource) || this.internal.private_channels.get("id", resource));
			}
		}
		if (resource instanceof User) {
			// see if a PM exists
			for (var pmchat of this.internal.private_channels) {
				if (pmchat.recipients.length === 1 && pmchat.recipient && pmchat.recipient.equals(resource)) {
					return Promise.resolve(pmchat);
				}
			}

			// PM does not exist :\
			return this.internal.startPM(resource);
		}
		var error = new Error("Could not resolve channel");
		// @ts-ignore
		error.resource = resource;
		return Promise.reject(error);
	}
}
exports.default = Resolver;
//# sourceMappingURL=Resolver.js.map
