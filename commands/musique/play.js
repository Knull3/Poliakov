const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Jouer une musique')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Nom ou URL de la musique')
				.setRequired(true)),
	
	async execute(interaction) {
		const query = interaction.options.getString('query');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🎵 Lecture de musique')
			.setDescription(`Lecture de : ${query} (stub)`)
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
}; 