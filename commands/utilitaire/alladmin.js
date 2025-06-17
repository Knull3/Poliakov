const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alladmin')
		.setDescription('Lister tous les administrateurs du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('👑 Administrateurs')
			.setDescription('Liste des administrateurs (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
