"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const Constants = require("../Constants");
const ArgumentRegulariser = require("../Util/ArgumentRegulariser");

/*

example data

{ position: -1,
    permissions: 36953089,
    name: '@everyone',
    managed: false,
    id: '110007368451915776',
    hoist: false,
    color: 0 }
*/

const DefaultRole = [Constants.Permissions.createInstantInvite, Constants.Permissions.readMessages, Constants.Permissions.readMessageHistory, Constants.Permissions.sendMessages, Constants.Permissions.sendTTSMessages, Constants.Permissions.embedLinks, Constants.Permissions.attachFiles, Constants.Permissions.readMessageHistory, Constants.Permissions.mentionEveryone, Constants.Permissions.voiceConnect, Constants.Permissions.voiceSpeak, Constants.Permissions.voiceUseVAD].reduce((previous, current) => previous | current, 0);

class Role {
	constructor(data, server, client) {
		this.position = data.position || -1;
		this.permissions = data.permissions || (data.name === "@everyone" ? DefaultRole : 0);
		this.name = data.name || "@everyone";
		this.managed = data.managed || false;
		this.id = data.id;
		this.hoist = data.hoist || false;
		this.color = data.color || 0;
		this.server = server;
		this.client = client;
		this.mentionable = data.mentionable || false;
	}

	get createdAt() {
		return new Date(+this.id / 4194304 + 1420070400000);
	}

	toObject() {
		let keys = ['id', 'position', 'permissions', 'name', 'managed', 'hoist', 'color', 'mentionable'],
		    obj = {};

		for (let k of keys) {
			obj[k] = this[k];
		}

		return obj;
	}

	serialise(explicit) {

		const hp = perm => this.hasPermission(perm, explicit);

		return {
			// general
			createInstantInvite: hp(Constants.Permissions.createInstantInvite),
			kickMembers: hp(Constants.Permissions.kickMembers),
			banMembers: hp(Constants.Permissions.banMembers),
			manageRoles: hp(Constants.Permissions.manageRoles),
			manageChannels: hp(Constants.Permissions.manageChannels),
			manageServer: hp(Constants.Permissions.manageServer),
			administrator: hp(Constants.Permissions.administrator),
			// text
			readMessages: hp(Constants.Permissions.readMessages),
			sendMessages: hp(Constants.Permissions.sendMessages),
			sendTTSMessages: hp(Constants.Permissions.sendTTSMessages),
			manageMessages: hp(Constants.Permissions.manageMessages),
			embedLinks: hp(Constants.Permissions.embedLinks),
			attachFiles: hp(Constants.Permissions.attachFiles),
			readMessageHistory: hp(Constants.Permissions.readMessageHistory),
			mentionEveryone: hp(Constants.Permissions.mentionEveryone),
			// voice
			voiceConnect: hp(Constants.Permissions.voiceConnect),
			voiceSpeak: hp(Constants.Permissions.voiceSpeak),
			voiceMuteMembers: hp(Constants.Permissions.voiceMuteMembers),
			voiceDeafenMembers: hp(Constants.Permissions.voiceDeafenMembers),
			voiceMoveMembers: hp(Constants.Permissions.voiceMoveMembers),
			voiceUseVAD: hp(Constants.Permissions.voiceUseVAD)
		};
	}

	serialize() {
		// ;n;
		return this.serialise();
	}

	hasPermission(perm, explicit = false) {
		if (perm instanceof String || typeof perm === "string") {
			perm = Constants.Permissions[perm];
		}
		if (!perm) {
			return false;
		}
		if (!explicit) {
			// implicit permissions allowed
			if (!!(this.permissions & Constants.Permissions.administrator)) {
				// manageRoles allowed, they have all permissions
				return true;
			}
		}
		// e.g.
		// !!(36953089 & Permissions.manageRoles) = not allowed to manage roles
		// !!(36953089 & (1 << 21)) = voice speak allowed

		return !!(this.permissions & perm);
	}

	setPermission(permission, value) {
		if (permission instanceof String || typeof permission === "string") {
			permission = Constants.Permissions[permission];
		}
		if (permission) {
			// valid permission
			if (value) {
				this.permissions |= permission;
			} else {
				this.permissions &= ~permission;
			}
		}
	}

	setPermissions(obj) {
		obj.forEach((value, permission) => {
			if (permission instanceof String || typeof permission === "string") {
				permission = Constants.Permissions[permission];
			}
			if (permission) {
				// valid permission
				this.setPermission(permission, value);
			}
		});
	}

	colorAsHex() {
		let val = this.color.toString(16);
		while (val.length < 6) {
			val = "0" + val;
		}
		return "#" + val;
	}

	delete() {
		return this.client.deleteRole.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}

	edit() {
		return this.client.updateRole.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}

	update() {
		return this.client.updateRole.apply(this.client, (ArgumentRegulariser.reg)(this, arguments));
	}

	addMember(member, callback) {
		return this.client.addMemberToRole.apply(this.client, [member, this, callback]);
	}

	addUser(member, callback) {
		return this.client.addUserToRole.apply(this.client, [member, this, callback]);
	}

	removeMember(member, callback) {
		return this.client.removeMemberFromRole.apply(this.client, [member, this, callback]);
	}

	removeUser(member, callback) {
		return this.client.removeUserFromRole.apply(this.client, [member, this, callback]);
	}

	mention() {
		if (this.mentionable) return `<@&${this.id}>`;
		return this.name;
	}

	toString() {
		return this.mention();
	}
}
module.exports = Role;
