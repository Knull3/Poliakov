import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('tempvoc')
		.setDescription('Gestion des salons vocaux temporaires')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les salons vocaux temporaires'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les salons vocaux temporaires'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'setup') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔊 Configuration Salons Vocaux Temporaires')
				.setDescription('**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
		if (subcommand === 'list') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Salons Vocaux Temporaires')
				.setDescription('Aucun salon temporaire configuré.\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
	}
};
