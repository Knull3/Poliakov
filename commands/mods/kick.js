const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Expulser un utilisateur du serveur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à expulser')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison de l\'expulsion')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction, client) {
		// Différer la réponse immédiatement pour éviter les erreurs de délai d'attente
		await interaction.deferReply();
		
		try {
			const user = interaction.options.getUser('user');
			const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
			
			// Récupérer le membre à partir de l'utilisateur
			const member = interaction.guild.members.cache.get(user.id);
			
			// Vérifier si le membre existe et peut être expulsé
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
			
			// Vérifier si le bot a la permission d'expulser
			if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur de permission')
							.setDescription(`Je n'ai pas la permission d'expulser des membres.`)
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le membre peut être expulsé (hiérarchie des rôles)
			if (!member.kickable) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Je ne peux pas expulser ${user.tag}. Vérifiez la hiérarchie des rôles.`)
							.setTimestamp()
					]
				});
			}
			
			// Expulser le membre
			await member.kick(reason);
			
			// Répondre avec succès
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👢 Expulsion')
				.setDescription(`L'utilisateur ${user} a été expulsé.\nRaison : ${reason}`)
				.setTimestamp();
			
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(`Erreur lors de l'expulsion:`, error);
			
			// Répondre avec l'erreur
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor('#8B0000')
						.setTitle('❌ Erreur')
						.setDescription(`Une erreur est survenue lors de l'expulsion: ${error.message}`)
						.setTimestamp()
				]
			});
		}
	}
};
