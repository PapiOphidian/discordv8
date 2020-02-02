const version = process.version;
/** @type {[string, string, string]} */
const versions = version.startsWith("v") ? version.substring(1).split(".") : version.split(".");
const [major, minor, patch] = versions.map(Number);

if ((major === 0 && minor < 12) || (major === 0 && minor === 12 && patch < 7)) {
	if (!process.env.OVERRIDE_DISCORD_MIN_VERSION) {
		throw new Error(
			"discord.js doesn't support node versions less than 0.12.7.\n" +
			"If you /really/ want to run it on this node " + process.version + ", then set OVERRIDE_DISCORD_MIN_VERSION as an environment variable.\n" +
			"This is unsupported and WILL cause problems."
		)
	}
}

module.exports = require("./rewrite");
