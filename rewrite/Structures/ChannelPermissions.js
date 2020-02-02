"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const Constants = require("../Constants");

class ChannelPermissions {
	constructor(permissions) {
		this.permissions = permissions;
	}

	serialise(explicit) {
		const hp = perm => this.hasPermission(perm, explicit);
		const json = {};

		for (const permission in Constants.Permissions) {
			json[permission] = hp(Constants.Permissions[permission]);
		}

		return json;
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
			if (!!(this.permissions & Constants.Permissions.manageRoles)) {
				// manageRoles allowed, they have all permissions
				return true;
			}
		}
		return !!(this.permissions & perm);
	}
}
module.exports = ChannelPermissions;
