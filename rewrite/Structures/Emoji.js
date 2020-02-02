"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const Constants = require("../Constants");

/* example data
{
	id: '164585980739846145'
	name: 'wlfSS',
	roles: [ '135829612780322816' ],
	require_colons: false,
	managed: true,
}
*/

class Emoji {
	constructor(data, server) {
		this.server = server;
		this.id = data.id;
		this.name = data.name;
		this.roleList = data.roles;
		this.colons = data.require_colons;
		this.managed = data.managed;
	}

	get roles() {
		const roleGroup = [];

		if (this.managed) {
			for (let i = 0; i < this.roleList.length; i++) {
				const roleID = this.roleList[i].toString();
				const role = this.server.roles.get("id", roleID);
				roleGroup.push(role);
			}
		}
		return roleGroup;
	}

	get getURL() {
		return Constants.Endpoints.EMOJI(this.id);
	}

	toObject() {
		let keys = ['id', 'name', 'roleList', 'colons', 'managed'],
				obj = {};

		for (let k of keys) {
			obj[k] = this[k];
		}

		return obj;
	}
}
module.exports = Emoji;
