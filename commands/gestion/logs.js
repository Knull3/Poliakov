const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('logs')
		.setDescription('Configuration des logs')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les logs'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('Voir le statut des logs'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📝 Configuration des Logs')
				.setDescription('**Types de logs disponibles :**\n• Modération (ban, kick, mute)\n• Messages (suppression, modification)\n• Membres (arrivée, départ)\n• Rôles (création, suppression)\n• Canaux (création, suppression)\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.addFields(
					{ name: '🔧 Statut', value: 'En développement', inline: true },
					{ name: '📅 Disponibilité', value: 'Prochaine mise à jour', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'status') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📊 Statut des Logs')
				.setDescription('**Logs actuellement configurés :**\n• Aucun log configuré\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
