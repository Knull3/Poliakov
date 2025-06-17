const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Affiche la liste de lecture actuelle'),
	
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
		
		const queue = client.player.nodes.get(guild)
		
		if (!queue || !queue.isPlaying()) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Aucune musique')
				.setDescription('Aucune musique n\'est en cours de lecture.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		const tracks = queue.tracks.toArray()
		const currentTrack = queue.currentTrack
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('📋 Liste de lecture')
			.setTimestamp()
		
		// Musique actuelle
		embed.addFields({
			name: '🎵 En cours',
			value: `**${currentTrack.title}** - ${currentTrack.duration || 'Inconnue'}`
		})
		
		// Prochaines musiques
		if (tracks.length > 0) {
			const trackList = tracks.slice(0, 10).map((track, index) => 
				`${index + 1}. **${track.title}** - ${track.duration || 'Inconnue'}`
			).join('\n')
			
			embed.addFields({
				name: '📝 Prochaines musiques',
				value: trackList
			})
			
			if (tracks.length > 10) {
				embed.addFields({
					name: '📊 Total',
					value: `${tracks.length} musiques dans la queue`
				})
			}
		} else {
			embed.addFields({
				name: '📝 Prochaines musiques',
				value: 'Aucune musique dans la queue'
			})
		}
		
		await interaction.reply({ embeds: [embed] })
	}
} 