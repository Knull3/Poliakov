import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Configuration des messages de départ')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer le message de départ'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('test')
				.setDescription('Tester le message de départ'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👋 Configuration Message de Départ')
				.setDescription('**Fonctionnalités disponibles :**\n• Message personnalisé\n• Embed configurable\n• Variables disponibles\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.addFields(
					{ name: '🔧 Statut', value: 'En développement', inline: true },
					{ name: '📅 Disponibilité', value: 'Prochaine mise à jour', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'test') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👋 Test Message de Départ')
				.setDescription(`**Simulation d'un départ :**\n\nAu revoir ${interaction.user} !\nNous espérons te revoir bientôt sur ${interaction.guild.name} !`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
