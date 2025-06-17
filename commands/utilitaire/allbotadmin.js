import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('allbotadmin')
		.setDescription('Lister tous les bots administrateurs du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🤖👑 Bots Administrateurs')
			.setDescription('Liste des bots administrateurs (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
