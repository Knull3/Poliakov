import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('roleinfo')
		.setDescription('Afficher les informations d\'un rôle')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle à afficher')
				.setRequired(true)),
	async execute(interaction) {
		const role = interaction.options.getRole('role');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Informations sur ${role.name}`)
			.setDescription('Fonctionnalité à venir (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
