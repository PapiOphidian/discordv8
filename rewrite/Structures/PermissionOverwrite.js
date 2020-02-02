"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const Constants = require("../Constants");

class PermissionOverwrite {

	constructor(data) {
		this.id = data.id;
		this.type = data.type; // member or role
		this.deny = data.deny;
		this.allow = data.allow;
	}

	// returns an array of allowed permissions
	get allowed() {
		const allowed = [];
		for (const permName in Constants.Permissions) {
			if (permName === "manageRoles" || permName === "manageChannels") {
				// these permissions do not exist in overwrites.
				continue;
			}

			if (!!(this.allow & Constants.Permissions[permName])) {
				allowed.push(permName);
			}
		}
		return allowed;
	}

	// returns an array of denied permissions
	get denied() {
		const denied = [];
		for (const permName in Constants.Permissions) {
			if (permName === "manageRoles" || permName === "manageChannels") {
				// these permissions do not exist in overwrites.
				continue;
			}

			if (!!(this.deny & Constants.Permissions[permName])) {
				denied.push(permName);
			}
		}
		return denied;
	}

	toObject() {
		let keys = ['id', 'type', 'allow', 'deny'],
		    obj = {};

		for (let k of keys) {
			obj[k] = this[k];
		}

		return obj;
	}

	setAllowed(allowedArray) {
		allowedArray.forEach(permission => {
			if (permission instanceof String || typeof permission === "string") {
				permission = Constants.Permissions[permission];
			}
			if (permission) {
				this.allow |= 1 << permission;
			}
		});
	}

	setDenied(deniedArray) {
		deniedArray.forEach(permission => {
			if (permission instanceof String || typeof permission === "string") {
				permission = Constants.Permissions[permission];
			}
			if (permission) {
				this.deny |= 1 << permission;
			}
		});
	}
}
module.exports = PermissionOverwrite;
