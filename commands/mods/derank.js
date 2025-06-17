import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('derank')
		.setDescription('Retirer tous les rôles d\'un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à derank')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('⏬ Derank')
			.setDescription(`Tous les rôles de ${user} ont été retirés (stub).`)
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
