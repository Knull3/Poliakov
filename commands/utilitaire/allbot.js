const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allbot')
		.setDescription('Lister tous les bots du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🤖 Bots')
			.setDescription('Liste des bots (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
