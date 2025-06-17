const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('perm')
		.setDescription('Gestion des permissions')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les permissions'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les permissions'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔐 Configuration des Permissions')
				.setDescription('**Types de permissions disponibles :**\n• Administrateur\n• Modérateur\n• Utilisateur\n• Rôles personnalisés\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.addFields(
					{ name: '🔧 Statut', value: 'En développement', inline: true },
					{ name: '📅 Disponibilité', value: 'Prochaine mise à jour', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'list') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Liste des Permissions')
				.setDescription('**Permissions actuellement configurées :**\n• Aucune permission configurée\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
