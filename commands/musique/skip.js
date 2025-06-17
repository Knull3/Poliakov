const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Passe à la musique suivante'),
	
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
		
		const queue = client.player.nodes.get(guild)
		
		if (!queue || !queue.isPlaying()) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Aucune musique')
				.setDescription('Aucune musique n\'est en cours de lecture.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		const currentTrack = queue.currentTrack
		
		try {
			await queue.node.skip()
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('⏭️ Musique passée')
				.setDescription(`**${currentTrack.title}** a été passée.`)
				.setTimestamp()
			
			await interaction.reply({ embeds: [embed] })
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('Erreur')
				.setDescription('Impossible de passer à la musique suivante.')
				.setTimestamp()
			
			await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
	}
} 