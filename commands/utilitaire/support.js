const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('Obtenir le lien du support'),
	async execute(interaction, client) {
		try {
			// Définir le lien du serveur de support (à configurer via une variable d'environnement)
			const supportLink = process.env.SUPPORT_SERVER || "https://discord.gg/votrelien";
			
			// Créer l'embed
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🆘 Support')
				.setDescription('Besoin d\'aide avec le bot ? Rejoignez notre serveur de support !')
				.addFields(
					{ name: 'Fonctionnalités', value: 'Obtenez de l\'aide sur les commandes et fonctionnalités du bot.' },
					{ name: 'Signaler des bugs', value: 'Signalez des bugs ou problèmes que vous rencontrez.' },
					{ name: 'Suggestions', value: 'Proposez des idées pour améliorer le bot.' }
				)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
				.setTimestamp();
			
			// Créer un bouton pour le lien du support
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setLabel('Rejoindre le serveur de support')
						.setURL(supportLink)
						.setStyle(ButtonStyle.Link)
				);
			
			// Ajouter un bouton pour l'invitation du bot
			const inviteLink = client.generateInvite({
				scopes: ['bot', 'applications.commands'],
				permissions: ['Administrator']
			});
			
			row.addComponents(
				new ButtonBuilder()
					.setLabel('Inviter le bot')
					.setURL(inviteLink)
					.setStyle(ButtonStyle.Link)
			);
			
			await interaction.reply({ embeds: [embed], components: [row] });
		} catch (error) {
			console.error('Erreur lors de l\'affichage du support:', error);
			await interaction.reply({ 
				content: 'Une erreur est survenue lors de l\'affichage des informations de support.', 
				ephemeral: true 
			});
		}
	}
};
