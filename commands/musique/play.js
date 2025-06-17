const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

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
		
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🎵 Système de musique')
			.setDescription('Le système de musique nécessite l\'installation de modules supplémentaires.')
			.addFields(
				{ name: 'Installation requise', value: '`npm install @discordjs/voice discord-player play-dl`', inline: false },
				{ name: 'Recherche', value: query, inline: true },
				{ name: 'Salon vocal', value: voiceChannel.name, inline: true }
			)
			.setTimestamp()
		
		await interaction.reply({ embeds: [embed] })
	}
} 