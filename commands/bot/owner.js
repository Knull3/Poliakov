const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('owner')
		.setDescription('Commandes réservées aux propriétaires du bot'),

	async execute(interaction, client) {
		if (!client.config.owner.includes(interaction.user.id)) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('👑 Commandes Owner')
			.setDescription(`
**Commandes disponibles :**
• \`/backup\` - Gestion des backups d'emojis
• \`/blacklist\` - Gestion de la blacklist
• \`/blacklistrank\` - Gestion de la blacklist rank
• \`/botconfig\` - Configuration du bot
• \`/botinfo\` - Informations du bot
• \`/server\` - Gestion des serveurs
• \`/theme\` - Configuration du thème

**Propriétaires actuels :**
${client.config.owner.map(id => `<@${id}>`).join('\n')}
			`)
			.setFooter({ text: client.config.name })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
};
