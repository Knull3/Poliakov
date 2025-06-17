import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('wl')
		.setDescription('Gestion de la whitelist')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un utilisateur à la whitelist')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à ajouter')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un utilisateur de la whitelist')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à retirer')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister la whitelist'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user');
		if (subcommand === 'add') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Whitelist')
				.setDescription(`L\'utilisateur ${user} a été ajouté à la whitelist.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
		if (subcommand === 'remove') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Whitelist')
				.setDescription(`L\'utilisateur ${user} a été retiré de la whitelist.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
		if (subcommand === 'list') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Whitelist')
				.setDescription('Aucun utilisateur dans la whitelist.\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
	}
};
