const db = require("../../util/db")
module.exports = async (client, message) => {


	let customcmdembed = await db.get(`customcmdembed_${message.content.toLowerCase()}`)
	if (customcmdembed !== null) {

		let embedj = customcmdembed

		if (!embedj.description) {} else {
			embedj.description = embedj.description.replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author)
		}
		if (!embedj.title) {} else {
			embedj.title = embedj.title.replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author)
		}
		if (!embedj.footer) {} else {
			embedj.footer.text = embedj.footer.text.replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:name}", message.guild.name).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{guild:member}", message.guild.memberCount).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:name}", message.author.username).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:tag}", message.author.tag).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user:id}", message.author.id).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author).replace("{user}", message.author)
		}

		message.channel.send({
			embed: embedj
		})


	}
	let customcmd = await db.get(`customcmd_${message.content.toLowerCase()}`)
	if (customcmd !== null) {

		message.channel.send(customcmd)

	}
}
