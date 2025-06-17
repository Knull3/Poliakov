const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Obtenir le lien d\'invitation du bot'),
	async execute(interaction, client) {
		await interaction.reply({ content: 'Lien d\'invitation à venir (stub).', ephemeral: true });
	}
};
