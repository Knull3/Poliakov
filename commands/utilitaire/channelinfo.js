const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('channelinfo')
		.setDescription('Afficher les informations d\'un salon')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Salon à afficher')
				.setRequired(false)),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.channel;
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Informations sur ${channel.name}`)
			.setDescription('Fonctionnalité à venir (stub).')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
