const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addrole')
		.setDescription('Ajouter un rôle à un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à qui ajouter le rôle')
				.setRequired(true))
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle à ajouter')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const role = interaction.options.getRole('role');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('➕ Ajout de Rôle')
			.setDescription(`Le rôle ${role} a été ajouté à ${user}.`)
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
