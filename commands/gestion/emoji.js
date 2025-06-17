const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emoji')
		.setDescription('Gestion des emojis')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Informations sur les emojis du serveur'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

	async execute(interaction, client) {
		const emojis = interaction.guild.emojis.cache;
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('😀 Emojis du Serveur')
			.setDescription(`**Statistiques :**\n• Total : ${emojis.size}\n• Animés : ${emojis.filter(e => e.animated).size}\n• Statiques : ${emojis.filter(e => !e.animated).size}`)
			.addFields(
				{ name: '📊 Limite', value: `${emojis.size}/${interaction.guild.premiumTier === 0 ? 50 : interaction.guild.premiumTier === 1 ? 100 : interaction.guild.premiumTier === 2 ? 150 : 500}`, inline: true },
				{ name: '💎 Boost Level', value: `Niveau ${interaction.guild.premiumTier}`, inline: true }
			)
			.setFooter({ text: client.config.name })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
};
