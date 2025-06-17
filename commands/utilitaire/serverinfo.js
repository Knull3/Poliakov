import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Affiche les informations sur le serveur'),
	
	async execute(interaction, client) {
		const guild = interaction.guild
		
		// Récupérer les informations du serveur
		const owner = await guild.fetchOwner()
		const totalMembers = guild.memberCount
		const botCount = guild.members.cache.filter(member => member.user.bot).size
		const humanCount = totalMembers - botCount
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`📊 Informations sur ${guild.name}`)
			.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
			.addFields(
				{ name: '👑 Propriétaire', value: owner.user.tag, inline: true },
				{ name: '🆔 ID du serveur', value: guild.id, inline: true },
				{ name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
				{ name: '👥 Membres', value: `${totalMembers}`, inline: true },
				{ name: '👤 Humains', value: `${humanCount}`, inline: true },
				{ name: '🤖 Bots', value: `${botCount}`, inline: true },
				{ name: '💬 Salons', value: `${guild.channels.cache.size}`, inline: true },
				{ name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
				{ name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true }
			)
			.setTimestamp()
			.setFooter({ text: client.config.name })
		
		// Ajouter des informations supplémentaires si disponibles
		if (guild.description) {
			embed.addFields({ name: '📝 Description', value: guild.description, inline: false })
		}
		
		if (guild.bannerURL()) {
			embed.setImage(guild.bannerURL({ size: 1024 }))
		}
		
		await interaction.reply({ embeds: [embed] })
	}
}
