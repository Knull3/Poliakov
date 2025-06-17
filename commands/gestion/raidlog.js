import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('raidlog')
		.setDescription('Afficher les logs de raid')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🛡️ Logs de Raid')
			.setDescription('Aucun log de raid pour le moment.\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
			.setFooter({ text: client.config.name })
			.setTimestamp();
		return interaction.reply({ embeds: [embed] });
	}
};
