const axios = require('axios');
const db = require("../../util/db")
const {
	MessageEmbed
} = require("discord.js");
const ms = require("ms")

module.exports = async (client, member) => {


	let leavedm = await db.get(`leavedme_${member.guild.id}`)
	if (leavedm) member.send(leavedm.replace("{user}", member)
		.replace("{user:username}", member.username)
		.replace("{user:tag}", member.tag)
		.replace("{user:id}", member.id)
		.replace("{guild:name}", member.guild.name)
		.replace("{guild:member}", member.guild.memberCount)
	)



}
