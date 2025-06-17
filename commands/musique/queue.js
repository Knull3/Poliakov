import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Afficher la file d\'attente de musique'),
	
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🎶 File d\'attente')
			.setDescription('Aucune musique dans la file d\'attente (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
}; 