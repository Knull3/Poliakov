const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Obtenir le lien d\'invitation du bot'),
	async execute(interaction, client) {
		try {
			// Générer un lien d'invitation avec les permissions recommandées
			const inviteLink = client.generateInvite({
				scopes: ['bot', 'applications.commands'],
				permissions: [
					'ViewChannel',
					'SendMessages',
					'ManageMessages',
					'EmbedLinks',
					'AttachFiles',
					'ReadMessageHistory',
					'UseExternalEmojis',
					'AddReactions',
					'ManageRoles',
					'ManageChannels',
					'ModerateMembers',
					'BanMembers',
					'KickMembers',
					'ManageNicknames',
					'ManageWebhooks',
					'ManageGuild',
					'CreatePublicThreads',
					'CreatePrivateThreads',
					'SendMessagesInThreads'
				]
			});
			
			// Créer un embed avec le lien d'invitation
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📨 Invitation du Bot')
				.setDescription(`Vous pouvez inviter ${client.user.username} sur votre serveur en cliquant sur le bouton ci-dessous.`)
				.addFields(
					{ name: 'Support', value: 'Si vous avez besoin d\'aide, utilisez la commande `/support`.' },
					{ name: 'Permissions', value: 'Le lien d\'invitation inclut les permissions recommandées pour que toutes les fonctionnalités du bot fonctionnent correctement.' }
				)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
				.setTimestamp();
			
			// Créer un bouton pour le lien d'invitation
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setLabel('Inviter le Bot')
						.setURL(inviteLink)
						.setStyle(ButtonStyle.Link)
				);
			
			// Ajouter un bouton pour le support si disponible
			if (process.env.SUPPORT_SERVER) {
				row.addComponents(
					new ButtonBuilder()
						.setLabel('Serveur de Support')
						.setURL(process.env.SUPPORT_SERVER)
						.setStyle(ButtonStyle.Link)
				);
			}
			
			await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
		} catch (error) {
			console.error('Erreur lors de la génération du lien d\'invitation:', error);
			await interaction.reply({ 
				content: 'Une erreur est survenue lors de la génération du lien d\'invitation.', 
				ephemeral: true 
			});
		}
	}
};
