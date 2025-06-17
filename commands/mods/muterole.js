import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('muterole')
		.setDescription('Définir le rôle muet du serveur')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle muet à définir')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) {
		const role = interaction.options.getRole('role');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔇 Rôle muet défini')
			.setDescription(`Le rôle muet du serveur est maintenant ${role} (stub).`)
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
