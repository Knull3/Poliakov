const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('theme')
		.setDescription('Affiche le thème actuel du bot'),

	async execute(interaction, client) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🎨 Thème du Bot')
			.setDescription(`Le thème actuel du bot utilise la couleur **Dark Red** (\`#8B0000\`)`)
			.addFields(
				{ name: '🎯 Couleur principale', value: '`#8B0000` (Dark Red)', inline: true },
				{ name: '📊 Statut', value: 'Streaming VScode', inline: true },
				{ name: '🔧 Type', value: 'Slash Commands', inline: true }
			)
			.setFooter({ text: client.config.name })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
};
