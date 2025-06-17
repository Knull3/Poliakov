const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { hasPermission, isPublicChannel } = require('../../util/permissions.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Joue de la musique depuis YouTube ou Spotify')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Lien YouTube/Spotify ou nom de la chanson')
				.setRequired(true)),
	
	async execute(interaction, client) {
		const member = interaction.member
		const guild = interaction.guild
		const channel = interaction.channel
		const query = interaction.options.getString('query')
		
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
		
		// Vérifier si l'utilisateur est en vocal
		const voiceChannel = member.voice.channel
		if (!voiceChannel) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Erreur')
				.setDescription('Vous devez être dans un salon vocal pour utiliser cette commande.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		await interaction.deferReply()
		
		try {
			// Créer la queue si elle n'existe pas
			const queue = client.player.nodes.create(guild, {
				metadata: {
					channel: interaction.channel,
					client: guild.members.me,
					requestedBy: interaction.user,
				},
				selfDeaf: true,
				volume: 80,
				leaveOnEmpty: true,
				leaveOnEmptyCooldown: 300000,
				leaveOnEnd: false,
				leaveOnStop: true,
			})
			
			// Rejoindre le salon vocal
			if (!queue.connection) {
				await queue.connect(voiceChannel)
			}
			
			// Rechercher et jouer la musique
			const result = await client.player.search(query, {
				requestedBy: interaction.user,
				searchEngine: 'auto'
			})
			
			if (!result || !result.tracks.length) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('Aucun résultat')
					.setDescription('Aucune musique trouvée pour votre recherche.')
					.setTimestamp()
				
				return interaction.editReply({ embeds: [errorEmbed] })
			}
			
			const track = result.tracks[0]
			
			// Ajouter la musique à la queue
			await queue.addTrack(track)
			
			if (!queue.isPlaying()) {
				await queue.node.play()
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🎵 Musique ajoutée')
				.setDescription(`**${track.title}** a été ajoutée à la queue.`)
				.addFields(
					{ name: 'Durée', value: track.duration || 'Inconnue', inline: true },
					{ name: 'Demandé par', value: interaction.user.tag, inline: true }
				)
				.setThumbnail(track.thumbnail)
				.setTimestamp()
			
			await interaction.editReply({ embeds: [embed] })
			
		} catch (error) {
			console.error('Erreur lors de la lecture:', error)
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Erreur')
				.setDescription('Une erreur est survenue lors de la lecture de la musique.')
				.setTimestamp()
			
			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}
} 