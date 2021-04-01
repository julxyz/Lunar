const { missingGuildPermissions, rolePositionCheck } = require(`../shared/functions.js`);

module.exports = {
	description: `Adds/removes role to member based on reaction added/removed`,
	roleAdd,
	roleRemove
};


async function roleAdd (client, reaction, user) {
	try { if (reaction.partial) reaction = await reaction.fetch() }
	catch (error) { return console.error(`Something went wrong when fetching a partial reaction: ${error}`) }

	const guildSettings = await client.settings.get(`${reaction.message.guild.id}.reactionRole`);
	const roles = guildSettings.messages[reaction.message.id]?.[reaction.emoji.id || reaction.emoji.name];

	if (!guildSettings.enabled || typeof roles === `undefined` || roles === null) return;
	if (await missingGuildPermissions(client, null, reaction.message.guild, [`MANAGE_ROLES`])) return console.error(`Missing permissions (MANAGE_ROLES) to add reaction role for guild: ${reaction.message.guild.id}!`);

	const member = reaction.message.guild.members.cache.get(user.id);

	if (!roles.every(async (role) => await rolePositionCheck(client, reaction.message.guild, role))) return console.error(`Client role lower than role when adding reaction role for guild: ${reaction.message.guild.id}`);
	return member.roles.add(roles).catch((error) => console.error(`Something went wrong when adding a reaction role: ${error}`));
}

async function roleRemove (client, reaction, user) {
	try { if (reaction.partial) reaction = await reaction.fetch() }
	catch (error) { return console.error(`Something went wrong when fetching a partial reaction: ${error}`) }

	const guildSettings = await client.settings.get(`${reaction.message.guild.id}.reactionRole`);
	const roles = guildSettings.messages[reaction.message.id]?.[reaction.emoji.id || reaction.emoji.name];

	if (!guildSettings.enabled || typeof roles === `undefined` || roles === null) return;
	if (await missingGuildPermissions(client, null, reaction.message.guild, [`MANAGE_ROLES`])) return console.error(`Missing permissions (MANAGE_ROLES) to remove reaction role for guild: ${reaction.message.guild.id}!`);

	const member = reaction.message.guild.members.cache.get(user.id);

	if (!roles.every(async (role) => await rolePositionCheck(client, reaction.message.guild, role))) return console.error(`Client role lower than role when removing reaction role for guild: ${reaction.message.guild.id}`);
	return member.roles.remove(roles).catch((error) => console.error(`Something went wrong when removing a reaction role: ${error}`));
}
