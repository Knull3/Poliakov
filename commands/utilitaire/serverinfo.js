const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Afficher les informations du serveur'),
	
	async execute(interaction) {
		const guild = interaction.guild
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Informations sur ${guild.name}`)
			.setDescription(`ID : ${guild.id}\nMembres : ${guild.memberCount}`)
			.setThumbnail(guild.iconURL({ dynamic: true }))
			.setTimestamp()
		
		await interaction.reply({ embeds: [embed] })
	}
}
