const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('renew')
		.setDescription('Renouveler le salon actuel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔄 Salon renouvelé')
			.setDescription('Le salon a été renouvelé (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
