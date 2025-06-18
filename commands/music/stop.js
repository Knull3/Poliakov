const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Arrêter la musique'),
	
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('⏹️ Musique arrêtée')
			.setDescription('La musique a été arrêtée (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
}; 