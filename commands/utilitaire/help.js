import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Affiche la liste des commandes disponibles'),
	
	async execute(interaction, client) {
		const util = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🔧 Commandes Utilitaires')
			.setDescription('Liste des commandes utilitaires disponibles')
			.addFields(
				{ name: '/ping', value: 'Affiche la latence du bot', inline: true },
				{ name: '/serverinfo', value: 'Informations sur le serveur', inline: true },
				{ name: '/userinfo', value: 'Informations sur un utilisateur', inline: true },
				{ name: '/banner', value: 'Affiche la bannière d\'un utilisateur', inline: true },
				{ name: '/invite', value: 'Affiche les invitations d\'un utilisateur', inline: true },
				{ name: '/pic', value: 'Affiche l\'avatar d\'un utilisateur', inline: true },
				{ name: '/snipe', value: 'Affiche le dernier message supprimé', inline: true },
				{ name: '/support', value: 'Lien vers le serveur de support', inline: true },
				{ name: '/top', value: 'Classement des membres', inline: true }
			)
				.setTimestamp()
			.setFooter({ text: client.config.name });

		const mod = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🛡️ Commandes de Modération')
			.setDescription('Liste des commandes de modération')
			.addFields(
				{ name: '/ban', value: 'Bannir un membre', inline: true },
				{ name: '/kick', value: 'Expulser un membre', inline: true },
				{ name: '/mute', value: 'Rendre muet un membre', inline: true },
				{ name: '/unmute', value: 'Rendre la parole à un membre', inline: true },
				{ name: '/clear', value: 'Supprimer des messages', inline: true },
				{ name: '/warn', value: 'Avertir un membre', inline: true },
				{ name: '/lock', value: 'Fermer un salon', inline: true },
				{ name: '/unlock', value: 'Ouvrir un salon', inline: true },
				{ name: '/banlist', value: 'Liste des membres bannis', inline: true }
			)
					.setTimestamp()
			.setFooter({ text: client.config.name });

		const music = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🎵 Commandes de Musique')
			.setDescription('Liste des commandes de musique')
			.addFields(
				{ name: '/play', value: 'Jouer de la musique', inline: true },
				{ name: '/stop', value: 'Arrêter la musique', inline: true },
				{ name: '/skip', value: 'Passer à la musique suivante', inline: true },
				{ name: '/queue', value: 'Afficher la liste de lecture', inline: true }
			)
					.setTimestamp()
			.setFooter({ text: client.config.name });

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('util')
					.setLabel('Utilitaires')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('mod')
					.setLabel('Modération')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('music')
					.setLabel('Musique')
					.setStyle(ButtonStyle.Success)
			);

		const response = await interaction.reply({ 
			embeds: [util], 
			components: [row],
			fetchReply: true 
		});

		// Create collector for button interactions
		const collector = response.createMessageComponentCollector({ 
			time: 60000 
		});

		collector.on('collect', async i => {
			if (i.user.id !== interaction.user.id) return;

			let embed;
			switch (i.customId) {
				case 'util':
					embed = util;
					break;
				case 'mod':
					embed = mod;
					break;
				case 'music':
					embed = music;
					break;
			}

			await i.update({ embeds: [embed] });
		});

		collector.on('end', () => {
			interaction.editReply({ 
				components: [],
				content: '⏰ Temps écoulé pour la navigation.'
			}).catch(() => {});
		});
		}
};
