import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('pic')
		.setDescription('Afficher la photo de profil d\'un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à afficher')
				.setRequired(false)),
	async execute(interaction) {
		const user = interaction.options.getUser('user') || interaction.user;
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Photo de profil de ${user.username}`)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
