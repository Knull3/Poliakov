import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bannit un membre du serveur')
		.addUserOption(option =>
			option.setName('membre')
				.setDescription('Le membre à bannir')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('raison')
				.setDescription('La raison du bannissement')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	
	async execute(interaction, client) {
		const targetUser = interaction.options.getUser('membre')
		const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée'
		
		// Vérifier si l'utilisateur peut être banni
		const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null)
		
		if (!targetMember) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Cet utilisateur n\'est pas membre de ce serveur.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
						}

		if (!targetMember.bannable) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Je ne peux pas bannir cet utilisateur.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
						}
		
		if (targetMember.id === interaction.user.id) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Vous ne pouvez pas vous bannir vous-même.')
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
		
		try {
			await targetMember.ban({ reason: `${reason} - Banni par ${interaction.user.tag}` })
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔨 Membre banni')
				.setDescription(`**${targetUser.tag}** a été banni du serveur.`)
				.addFields(
					{ name: 'Raison', value: reason, inline: true },
					{ name: 'Banni par', value: interaction.user.tag, inline: true }
				)
				.setTimestamp()
			
			await interaction.reply({ embeds: [embed] })
			
		} catch (error) {
			console.error('Erreur lors du bannissement:', error)
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Une erreur est survenue lors du bannissement.')
				.setTimestamp()
			
			await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
	}
}
