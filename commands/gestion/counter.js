import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('counter')
		.setDescription('Gestion des compteurs de serveur')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les compteurs de serveur'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('Voir le statut des compteurs'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📊 Configuration des Compteurs')
				.setDescription('**Fonctionnalités disponibles :**\n• Compteur de membres\n• Compteur de bots\n• Compteur de rôles\n• Compteur de canaux\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
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
				.setTitle('📈 Statut des Compteurs')
				.setDescription(`**Statistiques du serveur :**\n• Membres : ${interaction.guild.memberCount}\n• Rôles : ${interaction.guild.roles.cache.size}\n• Canaux : ${interaction.guild.channels.cache.size}\n• Emojis : ${interaction.guild.emojis.cache.size}`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
