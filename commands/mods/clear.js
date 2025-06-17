import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Supprimer des messages')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Nombre de messages à supprimer (1-100)')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100))
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Supprimer seulement les messages de cet utilisateur')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	
	async execute(interaction, client) {
		const amount = interaction.options.getInteger('amount')
		const user = interaction.options.getUser('user')
		
		await interaction.deferReply({ ephemeral: true })
		
		try {
			const messages = await interaction.channel.messages.fetch({ limit: 100 })
			let messagesToDelete = messages
			
			if (user) {
				messagesToDelete = messages.filter(msg => msg.author.id === user.id)
			}
			
			messagesToDelete = messagesToDelete.first(amount)
			
			if (messagesToDelete.length === 0) {
				return interaction.editReply({ content: '❌ Aucun message à supprimer trouvé.', ephemeral: true })
			}
			
			await interaction.channel.bulkDelete(messagesToDelete, true)
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🧹 Messages supprimés')
				.setDescription(`${messagesToDelete.length} message(s) ont été supprimés.`)
				.addFields(
					{ name: '📝 Canal', value: `${interaction.channel}`, inline: true },
					{ name: '🛡️ Modérateur', value: `${interaction.user.tag}`, inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp()
			
			return interaction.editReply({ embeds: [embed] })
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription(`Impossible de supprimer les messages : ${error.message}`)
				.setTimestamp()
			
			return interaction.editReply({ embeds: [errorEmbed] })
		}
	}
}
