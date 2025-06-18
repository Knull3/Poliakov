const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alladmin')
		.setDescription('Lister tous les administrateurs du serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			// Récupérer tous les membres du serveur
			const guild = interaction.guild;
			const members = await guild.members.fetch();
			
			// Filtrer les membres qui ont la permission d'administrateur
			const admins = members.filter(member => 
				member.permissions.has(PermissionFlagsBits.Administrator) && !member.user.bot
			);
			
			// Filtrer les bots qui ont la permission d'administrateur
			const adminBots = members.filter(member => 
				member.permissions.has(PermissionFlagsBits.Administrator) && member.user.bot
			);
			
			if (admins.size === 0 && adminBots.size === 0) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('👑 Administrateurs')
							.setDescription('Aucun administrateur trouvé sur ce serveur.')
							.setTimestamp()
					]
				});
			}
			
			// Créer une liste formatée des administrateurs
			let adminList = '';
			if (admins.size > 0) {
				adminList = admins.map(admin => `<@${admin.id}> (${admin.user.tag})`).join('\n');
			} else {
				adminList = 'Aucun administrateur humain';
			}
			
			// Créer une liste formatée des bots administrateurs
			let botList = '';
			if (adminBots.size > 0) {
				botList = adminBots.map(bot => `<@${bot.id}> (${bot.user.tag})`).join('\n');
			} else {
				botList = 'Aucun bot administrateur';
			}
			
			// Créer l'embed
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👑 Administrateurs')
				.setDescription(`**Nombre total d'administrateurs:** ${admins.size + adminBots.size}`)
				.addFields(
					{ name: `👤 Administrateurs (${admins.size})`, value: adminList },
					{ name: `🤖 Bots administrateurs (${adminBots.size})`, value: botList }
				)
				.setFooter({ text: `Serveur: ${guild.name}` })
				.setTimestamp();
			
			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			console.error('Erreur lors de la récupération des administrateurs:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la récupération des administrateurs.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
