import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Affiche les informations sur un utilisateur')
		.addUserOption(option =>
			option.setName('utilisateur')
				.setDescription('L\'utilisateur dont vous voulez voir les informations')
				.setRequired(false)),
	
	async execute(interaction, client) {
		const targetUser = interaction.options.getUser('utilisateur') || interaction.user
		const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null)
		
		if (!member) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Cet utilisateur n\'est pas membre de ce serveur.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		// Calculer les rôles
		const roles = member.roles.cache
			.filter(role => role.id !== interaction.guild.id)
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, 10)
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`👤 Informations sur ${targetUser.tag}`)
			.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
			.addFields(
				{ name: '🆔 ID', value: targetUser.id, inline: true },
				{ name: '📅 Compte créé le', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
				{ name: '📥 A rejoint le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
				{ name: '🎭 Rôle le plus haut', value: member.roles.highest.toString(), inline: true },
				{ name: '🎨 Couleur', value: member.displayHexColor, inline: true },
				{ name: '🤖 Bot', value: targetUser.bot ? 'Oui' : 'Non', inline: true }
			)
			.setTimestamp()
			.setFooter({ text: client.config.name })
		
		// Ajouter les rôles si il y en a
		if (roles.length > 0) {
			embed.addFields({
				name: `🎭 Rôles [${roles.length}]`,
				value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : ''),
				inline: false
			})
		}
		
		// Ajouter le statut si disponible
		if (member.presence) {
			const status = {
				online: '🟢 En ligne',
				idle: '🟡 Inactif',
				dnd: '🔴 Ne pas déranger',
				offline: '⚫ Hors ligne'
			}
			
			embed.addFields({
				name: '📊 Statut',
				value: status[member.presence.status] || '⚫ Hors ligne',
				inline: true
			})
		}
		
		await interaction.reply({ embeds: [embed] })
	}
}
