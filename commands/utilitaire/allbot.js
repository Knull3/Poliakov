const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allbot')
		.setDescription('Lister tous les bots du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			// Récupérer tous les membres du serveur
			const guild = interaction.guild;
			const members = await guild.members.fetch();
			
			// Filtrer les bots
			const bots = members.filter(member => member.user.bot);
			
			if (bots.size === 0) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('🤖 Bots')
							.setDescription('Aucun bot trouvé sur ce serveur.')
							.setTimestamp()
					]
				});
			}
			
			// Trier les bots par statut (en ligne, inactif, ne pas déranger, hors ligne)
			const onlineBots = bots.filter(bot => bot.presence?.status === 'online');
			const idleBots = bots.filter(bot => bot.presence?.status === 'idle');
			const dndBots = bots.filter(bot => bot.presence?.status === 'dnd');
			const offlineBots = bots.filter(bot => !bot.presence || bot.presence.status === 'offline');
			
			// Créer des listes formatées pour chaque statut
			let onlineList = '';
			if (onlineBots.size > 0) {
				onlineList = onlineBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n');
			} else {
				onlineList = 'Aucun bot en ligne';
			}
			
			let idleList = '';
			if (idleBots.size > 0) {
				idleList = idleBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n');
			} else {
				idleList = 'Aucun bot inactif';
			}
			
			let dndList = '';
			if (dndBots.size > 0) {
				dndList = dndBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n');
			} else {
				dndList = 'Aucun bot en ne pas déranger';
			}
			
			let offlineList = '';
			if (offlineBots.size > 0) {
				offlineList = offlineBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n');
			} else {
				offlineList = 'Aucun bot hors ligne';
			}
			
			// Créer l'embed
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🤖 Bots')
				.setDescription(`**Nombre total de bots:** ${bots.size}`)
				.setFooter({ text: `Serveur: ${guild.name}` })
				.setTimestamp();
			
			// Ajouter les champs uniquement s'il y a des bots dans cette catégorie
			if (onlineBots.size > 0) {
				embed.addFields({ name: `🟢 En ligne (${onlineBots.size})`, value: onlineList });
			}
			
			if (idleBots.size > 0) {
				embed.addFields({ name: `🟡 Inactif (${idleBots.size})`, value: idleList });
			}
			
			if (dndBots.size > 0) {
				embed.addFields({ name: `🔴 Ne pas déranger (${dndBots.size})`, value: dndList });
			}
			
			if (offlineBots.size > 0) {
				embed.addFields({ name: `⚫ Hors ligne (${offlineBots.size})`, value: offlineList });
			}
			
			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			console.error('Erreur lors de la récupération des bots:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la récupération des bots.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
