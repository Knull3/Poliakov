import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('Obtenir le lien du support'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🆘 Support')
			.setDescription('Lien du support à venir (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
