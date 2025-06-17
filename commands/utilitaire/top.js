const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('Afficher le classement du serveur'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🏆 Classement')
			.setDescription('Classement à venir (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
