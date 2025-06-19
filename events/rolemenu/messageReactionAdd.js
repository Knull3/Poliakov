const axios = require('axios');
const db = require("../../util/db.js");
const {
	MessageEmbed
} = require("discord.js");
const ms = require("ms")

module.exports = async (client, reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();
	if (user.bot) return;

	const {
		guild
	} = reaction.message;
	if (!guild) return;
	if (!guild.members.me.permissions.has("ManageRoles")) return;
	const member = guild.members.cache.get(user.id);
	if (!member) return;

	try {
		const data = await db.get(`reactions_${guild.id}`);
		if (!data) return;
		const reaction2 = data.find(
			(r) => r.emoji === reaction.emoji.toString() && r.msg === reaction.message.id
		);
		if (!reaction2) return;
		await member.roles.add(reaction2.roleId).catch(err => 
			console.error(`Erreur lors de l'ajout du rôle (${reaction2.roleId}) à ${member.user.tag}:`, err)
		);
	} catch (error) {
		console.error("Erreur dans messageReactionAdd:", error);
	}
}
