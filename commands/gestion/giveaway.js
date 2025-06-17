import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Gestion des giveaways')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Créer un giveaway')
				.addStringOption(option =>
					option.setName('prize')
						.setDescription('Prix à gagner')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('winners')
						.setDescription('Nombre de gagnants')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(10))
				.addStringOption(option =>
					option.setName('duration')
						.setDescription('Durée (ex: 1h, 1d, 1w)')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les giveaways actifs'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'create') {
			const prize = interaction.options.getString('prize');
			const winners = interaction.options.getInteger('winners');
			const duration = interaction.options.getString('duration');

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🎉 Giveaway Créé !')
				.setDescription(`**Prix :** ${prize}\n**Gagnants :** ${winners}\n**Durée :** ${duration}\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'list') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🎁 Giveaways Actifs')
				.setDescription('Aucun giveaway actif pour le moment.\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
