const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Passer la musique actuelle'),
	
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('⏭️ Musique passée')
			.setDescription('La musique a été passée (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
}; 