import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('levels')
		.setDescription('Gestion du système de niveaux')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer le système de niveaux'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('top')
				.setDescription('Voir le classement des niveaux'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rank')
				.setDescription('Voir votre niveau')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à vérifier')
						.setRequired(false)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📊 Configuration Système de Niveaux')
				.setDescription('**Fonctionnalités disponibles :**\n• Gain d\'XP par message\n• Récompenses automatiques\n• Classement\n• Notifications de niveau\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.addFields(
					{ name: '🔧 Statut', value: 'En développement', inline: true },
					{ name: '📅 Disponibilité', value: 'Prochaine mise à jour', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'top') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🏆 Classement des Niveaux')
				.setDescription('**Top 10 des membres :**\n\n1. **Aucun membre** - Niveau 0 (0 XP)\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'rank') {
			const user = interaction.options.getUser('user') || interaction.user;
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle(`📈 Niveau de ${user.username}`)
				.setDescription(`**Niveau :** 0\n**XP :** 0/100\n**Progression :** 0%`)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
