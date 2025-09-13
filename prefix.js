const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Affiche le préfixe du bot'),

	async execute(interaction, client) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔧 Préfixe du Bot')
			.setDescription(`Le préfixe actuel du bot est : \`${client.config.prefix}\``)
			.addFields(
				{ name: '💡 Utilisation', value: `\`${client.config.prefix}help\` pour voir toutes les commandes`, inline: true },
				{ name: '⚡ Alternative', value: 'Utilisez les slash commands (/)', inline: true }
			)
			.setFooter({ text: client.config.name })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
};
