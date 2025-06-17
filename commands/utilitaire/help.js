const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Afficher la liste des commandes'),
	
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('📖 Aide')
			.setDescription('Liste des commandes disponibles (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
