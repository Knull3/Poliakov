const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
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
		await interaction.deferReply();
		
		try {
			const user = interaction.options.getUser('user')
			const reason = interaction.options.getString('reason') || 'Aucune raison fournie'
			const days = interaction.options.getInteger('days') || 0
			
			const member = interaction.guild.members.cache.get(user.id)
			
			if (!member) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Impossible de trouver l'utilisateur ${user.tag} sur ce serveur.`)
							.setTimestamp()
					]
				});
			}
			
			if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur de permission')
							.setDescription(`Je n'ai pas la permission de bannir des membres.`)
							.setTimestamp()
					]
				});
			}
			
			if (!member.bannable) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Je ne peux pas bannir ${user.tag}. Vérifiez la hiérarchie des rôles.`)
							.setTimestamp()
					]
				});
			}
			
			if (member.roles.highest.position >= interaction.member.roles.highest.position) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Vous ne pouvez pas bannir quelqu'un avec un rôle supérieur ou égal au vôtre.`)
							.setTimestamp()
					]
				});
			}
			
			await member.ban({ deleteMessageDays: days, reason: `${reason} - Banni par ${interaction.user.tag}` })
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔨 Bannissement')
				.setDescription(`L'utilisateur ${user} a été banni.\nRaison : ${reason}`)
				.setTimestamp()
			
			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			console.error(`Erreur lors du bannissement:`, error)
			
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription(`Impossible de bannir l'utilisateur : ${error.message}`)
				.setTimestamp()
			
			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}
}
