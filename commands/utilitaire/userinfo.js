const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Afficher les informations d\'un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à afficher')
				.setRequired(false)),
	
	async execute(interaction) {
		const user = interaction.options.getUser('user') || interaction.user
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Informations sur ${user.username}`)
			.setDescription(`ID : ${user.id}\nTag : ${user.tag}`)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
		await interaction.reply({ embeds: [embed] })
	}
}
