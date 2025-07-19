const axios = require('axios');
const db = require("../../util/db")
const {
	MessageEmbed
} = require("discord.js");
const ms = require("ms")

module.exports = async (client, member) => {
	const guild = member.guild
	const color = await db.get(`color_${guild.id}`) === null ? client.config.color : await db.get(`color_${guild.id}`)
	let autoroleId = await db.get(`autorole_${member.guild.id}`)
	let rr = member.guild.roles.cache.get(autoroleId)
	if (rr) member.roles.add(rr.id)

	let joindm = await db.get(`joindmee_${member.guild.id}`)
	if (joindm) member.send(joindm.replace("{user}", member)
		.replace("{user:username}", member.username)
		.replace("{user:tag}", member.tag)
		.replace("{user:id}", member.id)
		.replace("{guild:name}", member.guild.name)
		.replace("{guild:member}", member.guild.memberCount)
	)
}
