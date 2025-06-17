import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
const { hasPermission, isPublicChannel } = require('../../util/permissions.js')

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Affiche la latence du bot et de l\'API Discord'),
	
	async execute(interaction, client) {
		const member = interaction.member
		const guild = interaction.guild
		const channel = interaction.channel
		
		// Vérification des permissions
		let perm = ""
		member.roles.cache.forEach(role => {
			if (client.db?.get(`modsp_${guild.id}_${role.id}`)) perm = true
			if (client.db?.get(`ownerp_${guild.id}_${role.id}`)) perm = true
			if (client.db?.get(`admin_${guild.id}_${role.id}`)) perm = true
		})
		
		const hasAccess = client.config.owner.includes(member.id) || 
						 client.db?.get(`ownermd_${client.user.id}_${member.id}`) === true || 
						 perm || 
						 client.db?.get(`channelpublic_${guild.id}_${channel.id}`) === true
		
		if (!hasAccess) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Permission refusée')
				.setDescription('Vous n\'avez pas la permission d\'utiliser cette commande.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		const embed = new EmbedBuilder()
			.setTitle('🏓 Calcul de la latence...')
			.addFields(
				{ name: 'Ping', value: 'Calcul en cours', inline: true },
				{ name: 'Latence', value: `${client.ws.ping}ms`, inline: true }
			)
			.setColor('#8B0000')
			.setTimestamp()
			.setFooter({ text: client.config.name })
		
		const reply = await interaction.reply({ embeds: [embed], fetchReply: true })
		
		const finalEmbed = new EmbedBuilder()
			.setTitle('🏓 Latence du bot')
			.addFields(
				{ name: 'Ping', value: `${reply.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
				{ name: 'Latence', value: `${client.ws.ping}ms`, inline: true }
			)
			.setColor('#8B0000')
			.setTimestamp()
			.setFooter({ text: client.config.name })

		await interaction.editReply({ embeds: [finalEmbed] })
	}
}
