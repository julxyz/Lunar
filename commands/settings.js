const { MessageEmbed } = require(`discord.js`);

const { missingChannelPermissions, rolePositionCheck } = require(`../shared/functions.js`);
const { successful, missingArgument, invalidArgument, missingMention, invalidMention, deniedConfirmation, noTime, wrongChannelForMessage, rolePositionHigher } = require(`../shared/messages.js`);
const validateTwitchChannel = require(`../features/twitch.js`).validateChannel;
const validateYouTubeChannel = require(`../features/youtube.js`).validateChannel;

const defaultGuildSettings = require(`../database/defaultGuildSettings.json`);


const CONFIRM_REACTION = `✅`;
const DENY_REACTION = `🚫`;

const BOOLEAN_TRUE = { name: `true`, description: `Set this setting to true` };
const BOOLEAN_FALSE = { name: `false`, description: `Set this setting to false` };

const RESET = { name: `reset`, description: `Reset configuration options related to this feature or entire Discord server` };

const CHANNEL_ADD = { name: `add`, description: `Add a channel to the list` };
const CHANNEL_REMOVE = { name: `remove`, description: `Remove a channel from the list` };
const CHANNEL_CLEAR = { name: `clear`, description: `Clear the list of channels` };

const LIST_CHANNELS = { name: `channels`, description: `Modify the list of channels` };
const LIST_MESSAGES = { name: `messages`, description: `Modify the list of messages` };

const MESSAGE_ADD = { name: `add`, description: `Add a response to the list` };
const MESSAGE_REMOVE = { name: `remove`, description: `Remove a response from the list` };
const MESSAGE_CLEAR = { name: `clear`, description: `Clear the list of responses` };
const MESSAGE_RESET = { name: `reset`, description: `Reset the list of responses` };

const FEATURE_ENABLE = { name: `enabled`, description: `Enable or disable this feature` };
const FEATURE_USERNAME = { name: `username`, description: `Set the channel username to send out announcements for` };

const LOCK_ROLE = { name: `role`, description: `Set the role to lock new members with` };
const LOCK_MESSAGE = { name: `message`, description: `Set the message for new members to unlock themselves` };

const REACTION_MESSAGES = { name: `messages`, description: `Manage reaction role messages` };
const REACTION_MESSAGE = { name: `message`, description: `Change the reaction role messages` };
const REACTION_REACTION = { name: `reaction`, description: `Change the reaction role reactions for a specific message` };
const REACTION_ROLE = { name: `role`, description: `Change the reaction role roles for a specific message and reaction` };
const REACTION_ADD = { name: `add`, description: `Add message/reaction/role to reaction role` };
const REACTION_REMOVE = { name: `remove`, description: `Remove message/reaction/role from reaction role` };
const REACTION_CLEAR = { name: `clear`, description: `Clear messages/reactions/roles from reaction role` };

const STATUS_STREAMER = { name: `streamerRole`, description: `Set a required role to be eligible to get the currently livestreaming role` };
const STATUS_ROLE = { name: `statusRole`, description: `Set the currently livestreaming role` };

const SETTINGS_LIST = { name: `list`, description: `List the current settings for this feature` };

const COMMAND_RESTRICT = { name: `restricted`, description: `Enable or disable command restriction to specified channel(s)` };

const COMMANDS_PREFIX = { name: `prefix`, description: `Set the command prefix for this Discord server` };
const COMMANDS_RESTRICTED_CHANNEL = { name: `restrictedChannel`, description: `Modify the list of restricted channels` };
const COMMANDS_ASK = { name: `ask`, description: `Change settings related to the ask command` };
const COMMANDS_ABOUT = { name: `about`, description: `Change settings related to the about command` };
const COMMANDS_BAN = { name: `ban`, description: `Change settings related to the ban command` };
const COMMANDS_CLEAR = { name: `clear`, description: `Change settings related to the clear command` };
const COMMANDS_INVITE = { name: `invite`, description: `Change settings related to the invite command` };
const COMMANDS_KICK = { name: `kick`, description: `Change settings related to the kick command` };
const COMMANDS_NICKNAME = { name: `nickname`, description: `Change settings related to the nickname command` };
const COMMANDS_SLOWMODE = { name: `slowmode`, description: `Change settings related to the slowmode command` };
const COMMANDS_SETTINGS = [SETTINGS_LIST, RESET, COMMANDS_PREFIX, COMMANDS_RESTRICTED_CHANNEL, COMMANDS_ASK, COMMANDS_ABOUT, COMMANDS_BAN, COMMANDS_CLEAR, COMMANDS_INVITE, COMMANDS_KICK, COMMANDS_NICKNAME, COMMANDS_SLOWMODE];

const WELCOME_WELCOME = { name: `welcome`, description: `Change settings related to welcome messages` };
const WELCOME_LEAVE = { name: `leave`, description: `Change settings related to leave messages` };

const FEATURE_COMMANDS = { name: `commands`, description: `Change settings related to commands` };
const FEATURE_REACTIONROLE = { name: `reactionRole`, description: `Change settings related to the Reaction Role feature` };
const FEATURE_SERVERLOCK = { name: `serverLock`, description: `Change settings related to the Server Lock feature` };
const FEATURE_STREAMSTATUS = { name: `streamStatus`, description: `Change settings related to the Stream Status feature` };
const FEATURE_TWITCH = { name: `twitch`, description: `Change settings related to the Twitch feature` };
const FEATURE_WELCOMEMESSAGE = { name: `welcomeMessage`, description: `Change settings related to the Welcome Message feature` };
const FEATURE_YOUTUBE = { name: `youtube`, description: `Change settings related to the YouTube feature` };
const FEATURE_SETTINGS = [FEATURE_COMMANDS, FEATURE_REACTIONROLE, FEATURE_SERVERLOCK, FEATURE_STREAMSTATUS, FEATURE_TWITCH, FEATURE_WELCOMEMESSAGE, FEATURE_YOUTUBE, RESET];


module.exports = {
	name: `settings`,
	aliases: [`options`],
	description: `A command used to change guild settings for the current Discord guild`,
	memberPermissions: [`MANAGE_GUILD`],
	guildPermissions: [],
	channelPermissions: [`ADD_REACTIONS`],
	args: false,
	execute,
	requestChannel,
	requestEmoji,
	requestMessage,
	requestRole,
	collectResponse,
	parseRole,
	parseChannel,
	addReactionRoleSettings,
	possibleSettings,
	FEATURE_SETTINGS
}


async function execute (client, message, args) {
	switch (args[0]) {
		case `commands`: return commandSettings(client, message, args);

		case `reactionRole`: return reactionRoleSettings(client, message, args);

		case `serverLock`: return serverLockSettings(client, message, args);

		case `streamStatus`: return streamStatusSettings(client, message, args);

		case `twitch`: return twitchSettings(client, message, args);

		case `welcomeMessage`: return welcomeMessageSettings(client, message, args);

		case `youtube`: return youtubeSettings(client, message, args);

		case `reset`: return resetSettings(client, message, ``);

		default: return message.channel.send(possibleSettings(client, FEATURE_SETTINGS));
	}
}

function commandSettings (client, message, args) {
	switch (args[1]) {
		case `prefix`: return commandPrefixSettings(client, message, args[2]);

		case `restrictedChannel`: return handleChannelSettings(client, message, args[2], args[3], `commands`, []);

		case `ask`: return commandAskSettings(client, message, args);

		case `about`:
		case `ban`:
		case `clear`:
		case `invite`:
		case `kick`:
		case `nickname`:
		case `slowmode`: return commandSpecificSettings(client, message, args, args[1]);

		case `list`: return listGuildSettings(client, message, `commands`);

		case `reset`: return resetSettings(client, message, `commands`);

		default: return message.channel.send(possibleSettings(client, COMMANDS_SETTINGS));
	}
}

function reactionRoleSettings (client, message, args) {
	switch (args[1]) {
		case `enabled`: return handleEnabledSettings(client, message, args[2], `reactionRole`);

		case `messages`: return handleReactionRoleSettings(client, message, args[2], args[3], args[4], args[5], args[6]);

		case `list`: return listGuildSettings(client, message, `reactionRole`);

		case `reset`: return resetSettings(client, message, `reactionRole`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, REACTION_MESSAGES, SETTINGS_LIST, RESET]));
	}
}

function serverLockSettings (client, message, args) {
	switch (args[1]) {
		case `enabled`: return handleEnabledSettings(client, message, args[2], `serverLock`);

		case `role`: return addRoleSettings(client, message, args[2], `serverLock.role`);

		case `message`: return serverLockMessageSettings(client, message, args[2], args[3], args[4], []);

		case `list`: return listGuildSettings(client, message, `serverLock`);

		case `reset`: return resetSettings(client, message, `serverLock`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, LOCK_ROLE, LOCK_MESSAGE, SETTINGS_LIST, RESET]));
	}
}

function streamStatusSettings (client, message, args) {
	switch (args[1]) {
		case `enabled`: return handleEnabledSettings(client, message, args[2], `streamStatus`);

		case `streamerRole`: return addRoleSettings(client, message, args[2], `streamStatus.streamerRole`);

		case `statusRole`: return addRoleSettings(client, message, args[2], `streamStatus.statusRole`);

		case `list`: return listGuildSettings(client, message, `streamStatus`);

		case `reset`: return resetSettings(client, message, `streamStatus`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, STATUS_STREAMER, STATUS_ROLE, SETTINGS_LIST, RESET]));
	}
}

function twitchSettings (client, message, args) {
	switch (args[1]) {
		case `enabled`: return handleEnabledSettings(client, message, args[2], `twitch`);

		case `username`: return handleUsernameSettings(client, message, args.slice(2).join(` `), `twitch`);

		case `channels`: return handleChannelSettings(client, message, args[2], args[3], `twitch`, ['MENTION_EVERYONE']);

		case `messages`: return handleMessageSettings(client, message, args[2], args.slice(3).join(` `), `twitch`);

		case `list`: return listGuildSettings(client, message, `twitch`);

		case `reset`: return resetSettings(client, message, `twitch`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, FEATURE_USERNAME, LIST_CHANNELS, LIST_MESSAGES, SETTINGS_LIST, RESET]));
	}
}

function welcomeMessageSettings (client, message, args) {
	switch (args[1]) {
		case `welcome`: return welcomeMessageSharedSettings(client, message, args, `welcome`);

		case `leave`: return welcomeMessageSharedSettings(client, message, args, `leave`);

		case `list`: return listGuildSettings(client, message, `welcomeMessage`);

		case `reset`: return resetSettings(client, message, `welcomeMessage`);

		default: return message.channel.send(possibleSettings(client, [WELCOME_WELCOME, WELCOME_LEAVE, SETTINGS_LIST, RESET]));
	}
}

function youtubeSettings (client, message, args) {
	switch (args[1]) {
		case `enabled`: return handleEnabledSettings(client, message, args[2], `youtube`);

		case `username`: return handleUsernameSettings(client, message, args[2], `youtube`);

		case `channels`: return handleChannelSettings(client, message, args[2], args[3], `youtube`, ['MENTION_EVERYONE']);

		case `messages`: return handleMessageSettings(client, message, args[2], args.slice(3).join(` `), `youtube`);

		case `list`: return listGuildSettings(client, message, `youtube`);

		case `reset`: return resetSettings(client, message, `youtube`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, FEATURE_USERNAME, LIST_CHANNELS, LIST_MESSAGES, SETTINGS_LIST, RESET]));
	}
}


function commandAskSettings (client, message, args) {
	switch (args[2]) {
		case `enabled`:
		case `restricted`: return commandSpecificSettings(client, message, args, `ask`);

		case `messages`: return handleMessageSettings(client, message, args[3], args.slice(4).join(` `), `commands.ask`);

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, COMMAND_RESTRICT, LIST_MESSAGES]));
	}
}

function commandSpecificSettings (client, message, args, command) {
	switch (args[2]) {
		case `enabled`: return handleEnabledSettings(client, message, args[3], `commands[${command}]`);

		case `restricted`:
			switch (args[3]) {
				case `true`: return commandChangeRestrictionSettings(client, message, command, true);

				case `false`: return commandChangeRestrictionSettings(client, message, command, false);

				default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
			}

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, COMMAND_RESTRICT]));
	}
}

async function commandPrefixSettings (client, message, newPrefix) {
	if (!newPrefix) return missingArgument(message.channel, `prefix`);

	await client.settings.set(`${message.guild.id}.commands.prefix`, newPrefix);
	return successful(message.channel);
}

async function commandChangeRestrictionSettings (client, message, command, boolean) {
	await client.settings.set(`${message.guild.id}.commands.${command}.restricted`, boolean);
	return successful(message.channel);
}

async function serverLockMessageSettings (client, message, channelMention, messageMention, emojiMention) {
	const newChannel = await parseChannel(client, message, channelMention, []);
	if (!newChannel) return;

	if (!await parseMessage(message, newChannel, messageMention)) return;

	const emoji = await parseEmoji(message, emojiMention);
	if (!emoji) return;

	await client.settings.set(`${message.guild.id}.serverLock.message`, { [messageMention]: emoji });
	return successful(message.channel);
}

function welcomeMessageSharedSettings (client, message, args, path) {
	switch (args[2]) {
		case `enabled`: return handleEnabledSettings(client, message, args[3], `welcomeMessage.${path}`);

		case `channels`: return handleChannelSettings(client, message, args[3], args[4], `welcomeMessage.${path}`, []);

		case `messages`: {
			const newMessage = args.slice(4).join(` `);
			if (!newMessage.includes(`[MEMBER]`)) return missingArgument(message.channel, `[MEMBER]`);

			return handleMessageSettings(client, message, args[3], newMessage, `welcomeMessage.${path}`);
		}

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, LIST_CHANNELS, LIST_MESSAGES]));
	}
}


function handleEnabledSettings (client, message, arg, path) {
	switch (arg) {
		case `true`: return changeEnabledSettings(client, message, true, path);

		case `false`: return changeEnabledSettings(client, message, false, path);

		default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
	}
}

function handleChannelSettings (client, message, action, arg, path, permissions) {
	switch (action) {
		case `add`: return addChannelSettings(client, message, arg, path, permissions);

		case `remove`: return removeChannelSettings(client, message, arg, path);

		case `clear`: return clearChannelSettings(client, message, path);

		default: return message.channel.send(possibleSettings(client, [CHANNEL_ADD, CHANNEL_REMOVE, CHANNEL_CLEAR]));
	}
}

function handleMessageSettings (client, message, action, arg, path) {
	switch (action) {
		case `add`: return addMessageSettings(client, message, arg, path);

		case `remove`: return removeMessageSettings(client, message, arg, path);

		case `clear`: return clearMessageSettings(client, message, path);

		case `reset`: return resetMessageSettings(client, message, path);

		default: return message.channel.send(possibleSettings(client, [MESSAGE_ADD, MESSAGE_REMOVE, MESSAGE_CLEAR, MESSAGE_RESET]));
	}
}

function handleReactionRoleSettings (client, message, action, object, messageMention, reactionMention, roleMention) {
	switch (action) {
		case `add`:
			switch (object) {
				case `message`: return addReactionRoleMessageSettings(client, message, messageMention);

				case `reaction`: return addReactionRoleReactionSettings(client, message, messageMention, reactionMention);

				case `role`: return addReactionRoleRoleSettings(client, message, messageMention, reactionMention, roleMention);

				default: return message.channel.send(possibleSettings(client, [REACTION_MESSAGE, REACTION_REACTION, REACTION_ROLE]));
			}

		case `remove`:
			switch (object) {
				case `message`: return removeReactionRoleMessageSettings(client, message, messageMention);

				case `reaction`: return removeReactionRoleReactionSettings(client, message, messageMention, reactionMention);

				case `role`: return removeReactionRoleRoleSettings(client, message, messageMention, reactionMention, roleMention);

				default: return message.channel.send(possibleSettings(client, [REACTION_MESSAGE, REACTION_REACTION, REACTION_ROLE]));
			}

		case `clear`:
			switch (object) {
				case `message`: return clearReactionRoleMessageSettings(client, message);

				case `reaction`: return clearReactionRoleReactionSettings(client, message, messageMention);

				case `role`: return clearReactionRoleRoleSettings(client, message, messageMention, reactionMention);

				default: return message.channel.send(possibleSettings(client, [REACTION_MESSAGE, REACTION_REACTION, REACTION_ROLE]));
			}

		default: return message.channel.send(possibleSettings(client, [REACTION_ADD, REACTION_REMOVE, REACTION_CLEAR]));
	}
}

async function handleUsernameSettings (client, message, username, path) {
	switch (path) {
		case `twitch`: return changeUsernameSettings(client, message, await validateTwitchChannel(message, username), `twitch`);

		case `youtube`: return changeUsernameSettings(client, message, await validateYouTubeChannel(client, message, username), `youtube`);
	}
}


async function changeEnabledSettings (client, message, boolean, path) {
	await client.settings.set(`${message.guild.id}.${path}.enabled`, boolean);
	return successful(message.channel);
}

async function addChannelSettings (client, message, channelMention, path, permissions) {
	const channel = await parseChannel(client, message, channelMention, permissions);
	if (!channel) return;

	await client.settings.push(`${message.guild.id}.${path}.channels`, channel.id, false);
	return successful(message.channel);
}

async function removeChannelSettings (client, message, channelMention, path) {
	const channel = await parseChannel(client, message, channelMention, []);
	if (!channel) return;

	await client.settings.remove(`${message.guild.id}.${path}.channels`, channel.id);
	return successful(message.channel);
}

async function clearChannelSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}.${path}.channels`, []);
	return successful(message.channel);
}

async function addMessageSettings (client, message, response, path) {
	if (!response) return missingArgument(message.channel, `message`);

	await client.settings.push(`${message.guild.id}.${path}.messages`, response, false);
	return successful(message.channel);
}

async function removeMessageSettings (client, message, response, path) {
	if (!response) return missingArgument(message.channel, `message`);
	if (!await client.settings.includes(`${message.guild.id}.${path}.messages`, response)) return invalidArgument(message.channel, `message`);

	await client.settings.remove(`${message.guild.id}.${path}.messages`, response);
	return successful(message.channel);
}

async function clearMessageSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}.${path}.messages`, []);
	return successful(message.channel);
}

async function resetMessageSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	let settings = defaultGuildSettings;
	path.split(`.`).forEach((key) => settings = settings[key]);

	await client.settings.set(`${message.guild.id}.${path}.messages`, settings.messages);
	return successful(message.channel);
}

async function addRoleSettings (client, message, roleMention, path) {
	const role = await parseRole(client, message, roleMention);
	if (!role) return;

	await client.settings.set(`${message.guild.id}.${path}`, role.id);
	return successful(message.channel);
}

async function addReactionRoleMessageSettings (client, message, messageMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	const newReaction = await requestEmoji(message);
	if (!newReaction) return;

	const newRole = await requestRole(client, message);
	if (!newRole) return;

	return addReactionRoleSettings(client, message, messageMention, newReaction, newRole);
}

async function addReactionRoleReactionSettings (client, message, messageMention, reactionMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	const newReaction = await parseEmoji(message, reactionMention);
	if (!newReaction) return;

	const newRole = await requestRole(client, message);
	if (!newRole) return;

	return addReactionRoleSettings(client, message, messageMention, newReaction, newRole);
}

async function addReactionRoleRoleSettings (client, message, messageMention, reactionMention, roleMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	const newReaction = await parseEmoji(message, reactionMention);
	if (!newReaction) return;

	const newRole = await parseRole(client, message, roleMention);
	if (!newRole) return;

	return addReactionRoleSettings(client, message, messageMention, newReaction, newRole);
}

async function removeReactionRoleMessageSettings (client, message, messageMention) {
	if (!await parseMessage(message, null, messageMention)) return;
	if (!await confirmChange(message)) return;

	await client.settings.delete(`${message.guild.id}.reactionRole.messages.${messageMention}`);
	return successful(message.channel);
}

async function removeReactionRoleReactionSettings (client, message, messageMention, reactionMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	newReaction = await parseEmoji(message, reactionMention);
	if (!newReaction) return;

	if (!await confirmChange(message)) return;

	await client.settings.delete(`${message.guild.id}.reactionRole.messages.${messageMention}.${newReaction}`);
	return successful(message.channel);
}

async function removeReactionRoleRoleSettings (client, message, messageMention, reactionMention, roleMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	newReaction = await parseEmoji(message, reactionMention);
	if (!newReaction) return;

	newRole = await parseRole(client, message, roleMention);
	if (!newRole) return;

	await client.settings.remove(`${message.guild.id}.reactionRole.messages.${messageMention}.${newReaction}`, newRole.id);
	return successful(message.channel);
}

async function clearReactionRoleMessageSettings (client, message) {
	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}.reactionRole.messages`, {});
	return successful(message.channel);
}

async function clearReactionRoleReactionSettings (client, message, messageMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}.reactionRole.messages.${messageMention}`, {});
	return successful(message.channel);
}

async function clearReactionRoleRoleSettings (client, message, messageMention, reactionMention) {
	if (!await parseMessage(message, null, messageMention)) return;

	newReaction = await parseEmoji(message, reactionMention);
	if (!newReaction) return;

	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}.reactionRole.messages.${messageMention}.${newReaction}`, []);
	return successful(message.channel);
}

async function addReactionRoleSettings (client, message, newMessage, newReaction, newRole) {
	await client.settings.ensure(`${message.guild.id}.reactionRole.messages.${newMessage}.${newReaction}`, []);
	await client.settings.push(`${message.guild.id}.reactionRole.messages.${newMessage}.${newReaction}`, newRole.id, false);
	return successful(message.channel);
}

async function changeUsernameSettings (client, message, newUsername, path) {
	if (!newUsername) return;

	await client.settings.set(`${message.guild.id}.${path}.username`, newUsername);
	return successful(message.channel);
}

async function listGuildSettings (client, message, path) {
	return message.channel.send(`Current settings for the **${path}** feature:\n\`\`\`JSON\n${JSON.stringify(await client.settings.get(`${message.guild.id}.${path}`), null, `\t`)}\`\`\``, { split: true });
}

async function resetSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	await client.settings.set(`${message.guild.id}${path.length ? `.${path}` : ``}`, (defaultGuildSettings[path] || defaultGuildSettings));
	return successful(message.channel);
}


function collectResponse (message) {
	return new Promise(async (resolve) => {
		try {
			const filter = (msg) => msg.author.id === message.author.id;

			const collected = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] });
			return resolve(collected.first());
		} catch {
			await noTime(message.channel);
			return resolve(false);
		}
	});
}

function confirmChange (message) {
	return new Promise(async (resolve) => {
		const confirmationMessage = await message.channel.send(`**WARNING**! This action is irreversible! Do you want to continue?`);
		await confirmationMessage.react(CONFIRM_REACTION);
		await confirmationMessage.react(DENY_REACTION);

		try {
			const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === CONFIRM_REACTION || reaction.emoji.name === DENY_REACTION);

			const collected = await confirmationMessage.awaitReactions(filter, { max: 1, time: 60000, errors: [`time`] });
			confirmationMessage.delete();

			const confirmation = collected.firstKey() === CONFIRM_REACTION ? true : false;
			if (!confirmation) await deniedConfirmation(message.channel);
			return resolve(confirmation);

		} catch {
			confirmationMessage.delete();
			await noTime(message.channel);
			return resolve(false);
		}
	});
}

function possibleSettings (client, settings) {
	const embed = new MessageEmbed()
		.setAuthor(`Change the bot configuration for this server!`, client.user.avatarURL())
		.setTitle(`Possible settings to change:`)
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	settings.forEach((setting) => embed.addField(setting.name, setting.description));

	return embed;
}


async function requestChannel (client, message, permissions) {
	const pollMessage = await message.channel.send(`Please respond with a **mention** of the preferred channel.`);
	const responseChannel = await collectResponse(message);

	if (!responseChannel) {
		pollMessage.delete();
		return false;
	}
	message.channel.bulkDelete([pollMessage, responseChannel], true);

	const newChannel = await parseChannel(client, responseChannel, responseChannel.content, permissions);
	return newChannel ? newChannel : false;
}

async function requestMessage (message) {
	const pollMessage = await message.channel.send(`Please respond with the **ID** of the preferred message.`);
	const responseMessage = await collectResponse(message);

	if (!responseMessage) {
		pollMessage.delete();
		return false;
	}
	message.channel.bulkDelete([pollMessage, responseMessage], true);

	const newMessage = await parseMessage(message, null, responseMessage.content);
	return newMessage ? newMessage : false;
}

async function requestRole (client, message) {
	const pollMessage = await message.channel.send(`Please respond with a **mention** of the preferred role.`);
	const responseRole = await collectResponse(message);

	if (!responseRole) {
		pollMessage.delete();
		return false;
	}
	message.channel.bulkDelete([pollMessage, responseRole], true);

	const newRole = await parseRole(client, responseRole, responseRole.content);
	return newRole ? newRole : false;
}

async function requestEmoji (message) {
	const pollMessage = await message.channel.send(`Please respond with the preferred **emoji**.`);
	const responseEmoji = await collectResponse(message);

	if (!responseEmoji) {
		pollMessage.delete();
		return false;
	}
	message.channel.bulkDelete([pollMessage, responseEmoji], true);

	const newEmoji = await parseEmoji(message, responseEmoji.content);
	return newEmoji ? newEmoji : false;
}

async function parseRole (client, message, roleMention) {
	if (!message.mentions.roles.size || !roleMention) {
		await missingMention(message.channel, `role`);
		return false;
	}

	const matches = roleMention.match(/^<@&(\d+)>$/);
	if (!matches) {
		await invalidMention(message.channel, `role`);
		return false;
	}

	if (!await rolePositionCheck(client, message.guild, matches[1])) {
		await rolePositionHigher(message.channel);
		return false;
	}

	return message.guild.roles.cache.get(matches[1]);
}

async function parseChannel (client, message, channelMention, permissions) {
	if (!message.mentions.channels.size || !channelMention) {
		await missingMention(message.channel, `channel`);
		return false;
	}

	const matches = channelMention.match(/^<#(\d+)>$/);
	if (!matches) {
		await invalidMention(message.channel, `channel`);
		return false;
	}

	const channel = client.channels.cache.get(matches[1]);

	allPermissions = permissions.concat([`VIEW_CHANNEL`, `SEND_MESSAGES`, `MANAGE_MESSAGES`]);
	if (await missingChannelPermissions(client, message, channel, allPermissions)) return false;

	return channel;
}

async function parseEmoji (message, emojiMention) {
	if (!emojiMention) {
		await missingMention(message.channel, `emoji`);
		return false;
	}

	const matches = emojiMention.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
	if (!matches && !emojiMention.match(/(?:\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb\udffc]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffd]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d])|(?:\ud83d[\udc68\udc69])(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a-\udc6d\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5\udeeb\udeec\udef4-\udefa\udfe0-\udfeb]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd1d\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd71\udd73-\udd76\udd7a-\udda2\udda5-\uddaa\uddae-\uddb4\uddb7\uddba\uddbc-\uddca\uddd0\uddde-\uddff\ude70-\ude73\ude78-\ude7a\ude80-\ude82\ude90-\ude95]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g)) {
		await invalidMention(message.channel, `emoji`);
		return false;
	}

	return matches ? matches[3] : emojiMention;
}

async function parseMessage (message, channel, messageMention) {
	if (!messageMention) {
		await missingArgument(message.channel, `message`);
		return false;
	}

	const matches = messageMention.match(/\d{17,19}/);
	if (!matches) {
		await invalidArgument(message.channel, `message`);
		return false;
	}

	if (channel != null) {
		try { await channel.messages.fetch(messageMention) }
		catch {
			await wrongChannelForMessage(message.channel);
			return false;
		}
	}

	return messageMention;
}
