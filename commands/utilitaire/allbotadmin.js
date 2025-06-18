const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allbotadmin')
		.setDescription('Lister tous les bots administrateurs du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			// Récupérer tous les membres du serveur
			const guild = interaction.guild;
			const members = await guild.members.fetch();
			
			// Filtrer les bots qui ont la permission d'administrateur
			const adminBots = members.filter(member => 
				member.user.bot && member.permissions.has(PermissionFlagsBits.Administrator)
			);
			
			if (adminBots.size === 0) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('🤖👑 Bots Administrateurs')
							.setDescription('Aucun bot administrateur trouvé sur ce serveur.')
							.setTimestamp()
					]
				});
			}
			
			// Trier les bots par statut (en ligne, inactif, ne pas déranger, hors ligne)
			const onlineBots = adminBots.filter(bot => bot.presence?.status === 'online');
			const idleBots = adminBots.filter(bot => bot.presence?.status === 'idle');
			const dndBots = adminBots.filter(bot => bot.presence?.status === 'dnd');
			const offlineBots = adminBots.filter(bot => !bot.presence || bot.presence.status === 'offline');
			
			// Créer l'embed
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🤖👑 Bots Administrateurs')
				.setDescription(`**Nombre total de bots administrateurs:** ${adminBots.size}`)
				.setFooter({ text: `Serveur: ${guild.name}` })
				.setTimestamp();
			
			// Ajouter les champs uniquement s'il y a des bots dans cette catégorie
			if (onlineBots.size > 0) {
				embed.addFields({ 
					name: `🟢 En ligne (${onlineBots.size})`, 
					value: onlineBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n')
				});
			}
			
			if (idleBots.size > 0) {
				embed.addFields({ 
					name: `🟡 Inactif (${idleBots.size})`, 
					value: idleBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n')
				});
			}
			
			if (dndBots.size > 0) {
				embed.addFields({ 
					name: `🔴 Ne pas déranger (${dndBots.size})`, 
					value: dndBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n')
				});
			}
			
			if (offlineBots.size > 0) {
				embed.addFields({ 
					name: `⚫ Hors ligne (${offlineBots.size})`, 
					value: offlineBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n')
				});
			}
			
			// Ajouter des informations sur les permissions
			embed.addFields({ 
				name: '⚠️ Avertissement de sécurité', 
				value: 'Les bots administrateurs ont un accès complet à votre serveur. Assurez-vous de ne donner cette permission qu\'aux bots de confiance.'
			});
			
			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			console.error('Erreur lors de la récupération des bots administrateurs:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la récupération des bots administrateurs.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
