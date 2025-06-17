import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Déverrouiller le salon actuel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔓 Salon déverrouillé')
			.setDescription('Le salon a été déverrouillé (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
