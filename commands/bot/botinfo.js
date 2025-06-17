import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Affiche les informations du bot'),

	async execute(interaction, client) {
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🤖 Informations du Bot')
			.setThumbnail(client.user.displayAvatarURL())
			.addFields(
				{ name: '📛 Nom', value: client.user.username, inline: true },
				{ name: '🆔 ID', value: client.user.id, inline: true },
				{ name: '📅 Créé le', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
				{ name: '🏠 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
				{ name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
				{ name: '📊 Ping', value: `${client.ws.ping}ms`, inline: true },
				{ name: '⚡ Version Discord.js', value: '14.x', inline: true },
				{ name: '🔧 Version Node.js', value: process.version, inline: true },
				{ name: '💾 Mémoire', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true }
			)
			.setFooter({ text: client.config.name })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
};
