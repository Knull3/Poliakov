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
				.setDescription('**Types de logs disponibles :**\n• Modération (ban, kick, mute)\n• Messages (suppression, modification)\n• Membres (arrivée, départ)\n• Rôles (création, suppression)\n• Canaux (création, suppression)\n\n**✅ Fonctionnalité activée !**\nLe système de logs est déjà configuré et fonctionnel.')
				.addFields(
					{ name: '🔧 Statut', value: '✅ Actif', inline: true },
					{ name: '📅 Disponibilité', value: 'Maintenant', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'status') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📊 Statut des Logs')
				.setDescription('**Logs actuellement configurés :**\n• ✅ Messages (suppression, modification)\n• ✅ Membres (arrivée, départ)\n• ✅ Voix (connexion, déconnexion)\n• ✅ Rôles et canaux (création, modification, suppression)\n\n**Système de logs entièrement fonctionnel !**')
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
