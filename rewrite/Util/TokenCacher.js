"use strict";
/* global process */

Object.defineProperty(exports, "__esModule", {
	value: true
});

const fs = require("fs");
const events = require("events");
const crypto = require("crypto");

const savePaths = [process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "Library/Preferences" : "/const/local"), process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"], process.cwd(), "/tmp"];

const algo = "aes-256-ctr";

function secureEmail(email, password) {
	return new Buffer(crypto.createHash("sha256").update(email + password, "utf8").digest()).toString("hex");
}

function exists(path) {
	// Node deprecated the `fs.exists` method apparently...
	try {
		fs.accessSync(path);
		return true;
	} catch (e) {
		return false;
	}
}

class TokenCacher extends events.EventEmitter {

	constructor(client, options) {
		super();
		this.client = client;
		this.savePath = null;
		this.error = false;
		this.done = false;
		this.data = {};
	}

	setToken(email = "", password = "", token = "") {
		email = secureEmail(email, password);
		const cipher = crypto.createCipher(algo, password);
		let crypted = cipher.update("valid" + token, "utf8", "hex");
		crypted += cipher.final("hex");
		this.data[email] = crypted;
		this.save();
	}

	save() {
		fs.writeFile(this.savePath, JSON.stringify(this.data), () => {});
	}

	getToken(email = "", password = "") {

		email = secureEmail(email, password);

		if (this.data[email]) {

			try {
				const decipher = crypto.createDecipher(algo, password);
				let dec = decipher.update(this.data[email], "hex", "utf8");
				dec += decipher.final("utf8");
				return dec.indexOf("valid") === 0 ? dec.substr(5) : false;
			} catch (e) {
				// not a valid token
				return null;
			}
		} else {
			return null;
		}
	}

	init(ind) {

		const self = this;
		const savePath = savePaths[ind];

		// Use one async function at the beginning, so the entire function is async,
		// then later use only sync functions to increase readability
		fs.stat(savePath, (err, dirStats) => {
			// Directory does not exist.
			if (err) error(err);else {
				try {
					const storeDirPath = savePath + "/.discordjs";
					const filePath = storeDirPath + "/tokens.json";

					if (!exists(storeDirPath)) {
						// First, make sure the directory exists, otherwise the next
						// call will fail.
						fs.mkdirSync(storeDirPath);
					}
					if (!exists(filePath)) {
						// This will create an empty file if the file doesn't exist, and error
						// if it does exist. We previously checked that it doesn't exist so we
						// can do this safely.
						fs.closeSync(fs.openSync(filePath, 'wx'));
					}

					const data = fs.readFileSync(filePath);
					try {
						// @ts-ignore
						this.data = JSON.parse(data);
						this.savePath = filePath;
						this.emit('ready');
						this.done = true;
					} catch (e) {
						// not valid JSON, make it valid and then write
						fs.writeFileSync(filePath, '{}');
						this.savePath = filePath;
						this.emit("ready");
						this.done = true;
					}
				} catch (e) {
					error(e);
				}
			}
		});

		function error(e) {
			ind++;
			if (!savePaths[ind]) {
				self.emit("error");
				self.error = e;
				self.done = true;
			} else {
				self.init(ind);
			}
		}
	}
}
module.exports = TokenCacher;
