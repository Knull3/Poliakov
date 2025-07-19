const Discord = require("discord.js");
// Désactivé car incompatible avec discord.js v14
// const disbut = require("discord-buttons")
const db = require("../../util/db")

module.exports = (client) => {
	console.log(`- Connecter ${client.user.username}`)
	client.guilds.cache.map(async guild => {
		await guild.members.fetch().catch(e => {})
	})
}
