const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('soutien')
		.setDescription('Gestion du soutien')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un soutien')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à ajouter')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un soutien')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à retirer')
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user');
		if (subcommand === 'add') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🤝 Soutien Ajouté')
				.setDescription(`L\'utilisateur ${user} a été ajouté comme soutien.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
		if (subcommand === 'remove') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Soutien Retiré')
				.setDescription(`L\'utilisateur ${user} a été retiré du soutien.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
	}
};
