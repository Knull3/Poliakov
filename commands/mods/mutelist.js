const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mutelist')
		.setDescription('Afficher la liste des utilisateurs muets')
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔇 Liste des muets')
			.setDescription('Aucun utilisateur muet trouvé (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
