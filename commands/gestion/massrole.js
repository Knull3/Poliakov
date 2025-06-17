import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('massrole')
		.setDescription('Gestion des rôles en masse')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un rôle à tous les membres')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('Rôle à ajouter')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un rôle de tous les membres')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('Rôle à retirer')
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const role = interaction.options.getRole('role');

		if (subcommand === 'add') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Rôle Ajouté en Masse')
				.setDescription(`**Rôle :** ${role}\n**Action :** Ajouté à tous les membres\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'remove') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Rôle Retiré en Masse')
				.setDescription(`**Rôle :** ${role}\n**Action :** Retiré de tous les membres\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
