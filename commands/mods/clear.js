const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Supprimer un nombre de messages')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Nombre de messages à supprimer')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100))
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Supprimer uniquement les messages de cet utilisateur')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		
		try {
			const amount = interaction.options.getInteger('amount');
			const user = interaction.options.getUser('user');
			const channel = interaction.channel;
			
			// Récupérer les messages
			const messages = await channel.messages.fetch({ limit: 100 });
			
			// Filtrer les messages si un utilisateur est spécifié
			let messagesToDelete;
			if (user) {
				messagesToDelete = messages.filter(msg => msg.author.id === user.id).first(amount);
			} else {
				messagesToDelete = messages.first(amount);
			}
			
			// Vérifier s'il y a des messages à supprimer
			if (messagesToDelete.length === 0) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Aucun message à supprimer.')
							.setTimestamp()
					],
					ephemeral: true
				});
			}
			
			// Vérifier si les messages ne sont pas trop anciens (plus de 14 jours)
			const now = Date.now();
			const twoWeeksAgo = now - 1209600000; // 14 jours en millisecondes
			
			const recentMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
			const oldMessages = messagesToDelete.filter(msg => msg.createdTimestamp <= twoWeeksAgo);
			
			// Supprimer les messages récents en masse
			if (recentMessages.length > 0) {
				await channel.bulkDelete(recentMessages, true);
			}
			
			// Supprimer les messages anciens un par un
			for (const message of oldMessages) {
				await message.delete().catch(() => {});
			}
			
			// Créer un message de confirmation
			const totalDeleted = recentMessages.length + oldMessages.length;
			
			const embed = new EmbedBuilder()
				.setColor('#00FF00')
				.setTitle('🗑️ Messages supprimés')
				.setDescription(`${totalDeleted} message${totalDeleted > 1 ? 's' : ''} ${totalDeleted > 1 ? 'ont' : 'a'} été supprimé${totalDeleted > 1 ? 's' : ''}.`)
				.setTimestamp();
				
			if (user) {
				embed.setDescription(`${totalDeleted} message${totalDeleted > 1 ? 's' : ''} de ${user} ${totalDeleted > 1 ? 'ont' : 'a'} été supprimé${totalDeleted > 1 ? 's' : ''}.`);
			}
			
			if (oldMessages.length > 0) {
				embed.setFooter({ text: `Note: ${oldMessages.length} message${oldMessages.length > 1 ? 's étaient' : ' était'} plus ancien${oldMessages.length > 1 ? 's' : ''} que 14 jours et ${oldMessages.length > 1 ? 'ont' : 'a'} été supprimé${oldMessages.length > 1 ? 's' : ''} individuellement.` });
			}
			
			await interaction.followUp({ embeds: [embed], ephemeral: true });
			
		} catch (error) {
			console.error('Erreur lors de la suppression des messages:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la suppression des messages.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
}
