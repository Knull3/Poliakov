import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
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
		const amount = interaction.options.getInteger('nombre')
		const targetUser = interaction.options.getUser('membre')
		
		await interaction.deferReply({ ephemeral: true })
		
		try {
			let messages
			
			if (targetUser) {
				// Supprimer les messages d'un utilisateur spécifique
				messages = await interaction.channel.messages.fetch({ limit: 100 })
				messages = messages.filter(msg => msg.author.id === targetUser.id).first(amount)
			} else {
				// Supprimer les messages généraux
				messages = await interaction.channel.messages.fetch({ limit: amount })
			}
			
			if (messages.length === 0) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription('Aucun message à supprimer trouvé.')
					.setTimestamp()
				
				return interaction.editReply({ embeds: [errorEmbed] })
			}
			
			// Supprimer les messages
			await interaction.channel.bulkDelete(messages, true)
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🧹 Messages supprimés')
				.setDescription(`**${messages.length}** message(s) ont été supprimés.`)
				.addFields(
					{ name: 'Salon', value: interaction.channel.name, inline: true },
					{ name: 'Supprimé par', value: interaction.user.tag, inline: true }
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
				.setTitle('❌ Erreur')
				.setDescription('Une erreur est survenue lors de la suppression des messages.')
				.setTimestamp()
			
			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}
}
