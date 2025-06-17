import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Verrouiller le salon actuel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔒 Salon verrouillé')
			.setDescription('Le salon a été verrouillé (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
