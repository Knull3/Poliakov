import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bannir un utilisateur du serveur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à bannir')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison du bannissement')
				.setRequired(false))
		.addIntegerOption(option =>
			option.setName('days')
				.setDescription('Nombre de jours de messages à supprimer (0-7)')
				.setMinValue(0)
				.setMaxValue(7)
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	
	async execute(interaction, client) {
		const user = interaction.options.getUser('user')
		const reason = interaction.options.getString('reason') || 'Aucune raison fournie'
		const days = interaction.options.getInteger('days') || 0
		
		const member = interaction.guild.members.cache.get(user.id)
		
		if (!member) {
			return interaction.reply({ content: '❌ Cet utilisateur n\'est pas sur ce serveur.', ephemeral: true })
		}
		
		if (!member.bannable) {
			return interaction.reply({ content: '❌ Je ne peux pas bannir cet utilisateur.', ephemeral: true })
		}
		
		if (member.roles.highest.position >= interaction.member.roles.highest.position) {
			return interaction.reply({ content: '❌ Vous ne pouvez pas bannir quelqu\'un avec un rôle supérieur ou égal au vôtre.', ephemeral: true })
		}
		
		try {
			await member.ban({ deleteMessageDays: days, reason: `${reason} - Banni par ${interaction.user.tag}` })
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔨 Bannissement')
				.setDescription(`L'utilisateur ${user} a été banni.\nRaison : ${reason}`)
				.setTimestamp()
			
			return interaction.reply({ embeds: [embed] })
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription(`Impossible de bannir l'utilisateur : ${error.message}`)
				.setTimestamp()
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
	}
}
