"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

const API = "https://discordapp.com/api";
const CDN = "https://cdn.discordapp.com";
const Endpoints = {
	// general endpoints
	LOGIN: `${API}/auth/login`,
	LOGOUT: `${API}/auth/logout`,
	ME: `${API}/users/@me`,
	ME_CHANNELS: `${API}/users/@me/channels`,
	/** @param {string} serverID */
	ME_SERVER: serverID => `${Endpoints.ME}/guilds/${serverID}`,
	/** @param {string} appID */
	OAUTH2_APPLICATION: appID => `${API}/oauth2/applications/${appID}`,
	ME_NOTES: `${API}/users/@me/notes`,
	GATEWAY: `${API}/gateway`,
	/**
	 * @param {string} userID
	 * @param {string} avatar
	 */
	AVATAR: (userID, avatar) => `${API}/users/${userID}/avatars/${avatar}.jpg`,
	/** @param {string} id */
	INVITE: id => `${API}/invite/${id}`,

	// emojis
	/** @param {string} emojiID */
	EMOJI: emojiID => `${CDN}/emojis/${emojiID}.png`,

	// servers
	SERVERS: `${API}/guilds`,
	/** @param {string} serverID */
	SERVER: serverID => `${Endpoints.SERVERS}/${serverID}`,
	/**
	 * @param {string} serverID
	 * @param {string} hash
	 */
	SERVER_ICON: (serverID, hash) => `${Endpoints.SERVER(serverID)}/icons/${hash}.jpg`,
	/** @param {string} serverID */
	SERVER_PRUNE: serverID => `${Endpoints.SERVER(serverID)}/prune`,
	/** @param {string} serverID */
	SERVER_EMBED: serverID => `${Endpoints.SERVER(serverID)}/embed`,
	/** @param {string} serverID */
	SERVER_INVITES: serverID => `${Endpoints.SERVER(serverID)}/invites`,
	/** @param {string} serverID */
	SERVER_ROLES: serverID => `${Endpoints.SERVER(serverID)}/roles`,
	/** @param {string} serverID */
	SERVER_BANS: serverID => `${Endpoints.SERVER(serverID)}/bans`,
	/** @param {string} serverID */
	SERVER_INTEGRATIONS: serverID => `${Endpoints.SERVER(serverID)}/integrations`,
	/** @param {string} serverID */
	SERVER_MEMBERS: serverID => `${Endpoints.SERVER(serverID)}/members`,
	/** @param {string} serverID */
	SERVER_CHANNELS: serverID => `${Endpoints.SERVER(serverID)}/channels`,
	/** @param {string} serverID */
	SERVER_WEBHOOKS: serverID => `${Endpoints.SERVER(serverID)}/webhooks`,

	// channels
	CHANNELS: `${API}/channels`,
	/** @param {string} channelID */
	CHANNEL: channelID => `${Endpoints.CHANNELS}/${channelID}`,
	/** @param {string} channelID */
	CHANNEL_MESSAGES: channelID => `${Endpoints.CHANNEL(channelID)}/messages`,
	/** @param {string} channelID */
	CHANNEL_INVITES: channelID => `${Endpoints.CHANNEL(channelID)}/invites`,
	/** @param {string} channelID */
	CHANNEL_TYPING: channelID => `${Endpoints.CHANNEL(channelID)}/typing`,
	/** @param {string} channelID */
	CHANNEL_PERMISSIONS: channelID => `${Endpoints.CHANNEL(channelID)}/permissions`,
	/**
	 * @param {string} channelID
	 * @param {string} messageID
	 */
	CHANNEL_MESSAGE: (channelID, messageID) => `${Endpoints.CHANNEL_MESSAGES(channelID)}/${messageID}`,
	/** @param {string} channelID */
	CHANNEL_PINS: channelID => `${Endpoints.CHANNEL(channelID)}/pins`,
	/**
	 * @param {string} channelID
	 * @param {string} messageID
	 */
	CHANNEL_PIN: (channelID, messageID) => `${Endpoints.CHANNEL_PINS(channelID)}/${messageID}`,
	/** @param {string} channelID */
	CHANNEL_WEBHOOKS: channelID => `${Endpoints.CHANNEL(channelID)}/webhooks`,

	// webhooks
	WEBHOOKS: `${API}/webhooks`,
	/** @param {string} webhookID */
	WEBHOOK: webhookID => `${Endpoints.WEBHOOKS}/${webhookID}`,
	/**
	 * @param {string} webhookID
	 * @param {string} webhookToken
	 */
	WEBHOOK_WITH_TOKEN: (webhookID, webhookToken) => `${Endpoints.WEBHOOKS}/${webhookToken}`,
	/**
	 * @param {string} webhookID
	 * @param {string} webhookToken
	 */
	WEBHOOK_MESSAGE: (webhookID, webhookToken) => `${Endpoints.WEBHOOK(webhookID)}/${webhookToken}`,
	/**
	 * @param {string} webhookID
	 * @param {string} webhookToken
	 */
	WEBHOOK_MESSAGE_SLACK: (webhookID, webhookToken) => `${Endpoints.WEBHOOK_MESSAGE(webhookID, webhookToken)}/slack`,

	// friends
	FRIENDS: `${API}/users/@me/relationships`
}
const Permissions = {
	// general
	createInstantInvite: 1 << 0,
	kickMembers: 1 << 1,
	banMembers: 1 << 2,
	administrator: 1 << 3,
	manageChannels: 1 << 4,
	manageChannel: 1 << 4,
	manageServer: 1 << 5,
	changeNickname: 1 << 26,
	manageNicknames: 1 << 27,
	manageRoles: 1 << 28,
	managePermissions: 1 << 28,
	// text
	readMessages: 1 << 10,
	sendMessages: 1 << 11,
	sendTTSMessages: 1 << 12,
	manageMessages: 1 << 13,
	embedLinks: 1 << 14,
	attachFiles: 1 << 15,
	readMessageHistory: 1 << 16,
	mentionEveryone: 1 << 17,
	// voice
	voiceConnect: 1 << 20,
	voiceSpeak: 1 << 21,
	voiceMuteMembers: 1 << 22,
	voiceDeafenMembers: 1 << 23,
	voiceMoveMembers: 1 << 24,
	voiceUseVAD: 1 << 25

};
const PacketType = {
	CHANNEL_CREATE: "CHANNEL_CREATE",
	CHANNEL_DELETE: "CHANNEL_DELETE",
	CHANNEL_UPDATE: "CHANNEL_UPDATE",
	MESSAGE_CREATE: "MESSAGE_CREATE",
	MESSAGE_DELETE: "MESSAGE_DELETE",
	MESSAGE_DELETE_BULK: "MESSAGE_DELETE_BULK",
	MESSAGE_UPDATE: "MESSAGE_UPDATE",
	PRESENCE_UPDATE: "PRESENCE_UPDATE",
	READY: "READY",
	RESUMED: "RESUMED",
	SERVER_BAN_ADD: "GUILD_BAN_ADD",
	SERVER_BAN_REMOVE: "GUILD_BAN_REMOVE",
	SERVER_CREATE: "GUILD_CREATE",
	SERVER_DELETE: "GUILD_DELETE",
	SERVER_MEMBER_ADD: "GUILD_MEMBER_ADD",
	SERVER_MEMBER_REMOVE: "GUILD_MEMBER_REMOVE",
	SERVER_MEMBER_UPDATE: "GUILD_MEMBER_UPDATE",
	SERVER_MEMBERS_CHUNK: "GUILD_MEMBERS_CHUNK",
	SERVER_ROLE_CREATE: "GUILD_ROLE_CREATE",
	SERVER_ROLE_DELETE: "GUILD_ROLE_DELETE",
	SERVER_ROLE_UPDATE: "GUILD_ROLE_UPDATE",
	SERVER_SYNC: "GUILD_SYNC",
	SERVER_UPDATE: "GUILD_UPDATE",
	TYPING: "TYPING_START",
	USER_UPDATE: "USER_UPDATE",
	USER_NOTE_UPDATE: "USER_NOTE_UPDATE",
	VOICE_STATE_UPDATE: "VOICE_STATE_UPDATE",
	FRIEND_ADD: "RELATIONSHIP_ADD",
	FRIEND_REMOVE: "RELATIONSHIP_REMOVE"
};

module.exports = { API, CDN, Endpoints, Permissions, PacketType };
