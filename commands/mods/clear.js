const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Supprime un nombre spécifique de messages')
		.addIntegerOption(option =>
			option.setName('nombre')
				.setDescription('Nombre de messages à supprimer (1-100)')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100))
		.addUserOption(option =>
			option.setName('membre')
				.setDescription('Supprimer seulement les messages de ce membre')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	
	async execute(interaction, client) {
		const member = interaction.member
		const guild = interaction.guild
		const channel = interaction.channel
		const amount = interaction.options.getInteger('nombre')
		const targetUser = interaction.options.getUser('membre')
		
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
		
		// Vérifier les permissions du bot
		if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.ManageMessages)) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Erreur')
				.setDescription('Je n\'ai pas la permission de supprimer des messages dans ce salon.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		await interaction.deferReply({ ephemeral: true })
		
		try {
			let deletedCount = 0
			
			if (targetUser) {
				// Supprimer les messages d'un utilisateur spécifique
				const messages = await channel.messages.fetch({ limit: 100 })
				const userMessages = messages.filter(msg => msg.author.id === targetUser.id).first(amount)
				
				if (userMessages.length > 0) {
					await channel.bulkDelete(userMessages, true)
					deletedCount = userMessages.length
				}
			} else {
				// Supprimer le nombre spécifié de messages
				const deleted = await channel.bulkDelete(amount, true)
				deletedCount = deleted.size
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🧹 Messages supprimés')
				.setDescription(`${deletedCount} message(s) ont été supprimés.`)
				.addFields(
					{ name: 'Salon', value: channel.name, inline: true },
					{ name: 'Par', value: member.user.tag, inline: true }
				)
				.setTimestamp()
			
			if (targetUser) {
				embed.addFields({ name: 'Utilisateur ciblé', value: targetUser.tag, inline: true })
			}
			
			await interaction.editReply({ embeds: [embed] })
			
		} catch (error) {
			console.error('Erreur lors de la suppression:', error)
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Erreur')
				.setDescription('Une erreur est survenue lors de la suppression des messages.')
				.setTimestamp()
			
			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}
}
